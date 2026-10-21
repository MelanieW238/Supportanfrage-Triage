(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.Triage = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const MAX_LENGTH = 5000;
  const QUOTE_MAX = 240;
  const MIN_SCORE = 2;

  const w = (src) => new RegExp('(?<![\\p{L}\\p{N}])(?:' + src + ')', 'iu');

  // [Gewicht, Muster]: Jedes Muster zählt höchstens einmal pro Kategorie.
  const CATEGORIES = {
    'Zugang': [
      [2, w('passwort|kennwort|zugangsdaten')],
      [2, w('login|log-in|einlogg|einzuloggen|anmeld|anzumelden')],
      [2, w('2fa(?![\\p{L}])|zwei-?faktor|authenticator|bestätigungscode')],
      [1, w('zugang|zugriff|benutzername|account|benutzerkonto|registrier')],
      [1, w('gesperrt|sperr')],
    ],
    'Abrechnung': [
      [2, w('(?:ab)?rechnung')],
      [2, w('abbuch|abgebucht|lastschrift|gutschrift')],
      [2, w('erstattung|rückerstattung|rückzahlung|zurückerstattet')],
      [2, w('mahnung|inkasso|mahnbescheid')],
      [1, w('zahlung|bezahl|gezahlt')],
      [1, w('gebühr|preis|kosten|betrag|tarif|euro|€')],
      [1, w('abo(?![\\p{L}])|abonnement|kündig|vertrag|guthaben')],
    ],
    'Technisches Problem': [
      [2, w('absturz|abgestürzt|stürzt|bug(?![\\p{L}])|exception|error|ausgefallen|störung')],
      [1, w('fehlermeldung|fehler')],
      [1, w('(?:funktioniert|geht|lädt)\\s+(?:\\S+\\s+){0,3}nicht')],
      [1, w('langsam|hängt|einfriert|eingefroren|leerer\\s+bildschirm|weiße\\s+seite')],
      [1, w('apps?(?![\\p{L}])|update|installation|synchronis|browser|programm|software')],
    ],
    'Sonstiges': [
      [2, w('feedback|vorschlag|lob(?![\\p{L}])|kooperation|partnerschaft|presse|datenschutz|auskunft|öffnungszeiten|wunsch')],
      [1, w('frage|fragen|kontakt|beschwerde|anliegen')],
    ],
  };

  const TRIGGERS = [
    {
      reason: 'sicherheit',
      label: 'Sicherheitsrisiko',
      re: w('gehackt|hackerangriff|unbefugt|fremdzugriff|fremder\\s+zugriff|datenleck|datenpanne|kompromittiert|phishing|ransomware|malware|identitätsdiebstahl'),
    },
    {
      reason: 'blockade',
      label: 'komplette Blockade',
      re: w('(?:komplett|völlig|total|vollständig)\\s+(?:ausgefallen|down|blockiert|lahmgelegt)|nichts\\s+(?:mehr\\s+)?(?:funktioniert|geht)|(?:produktion|betrieb|kasse|shop|alles)\\s+steht|lahmgelegt'),
    },
    {
      reason: 'finanziell',
      label: 'unmittelbar drohender finanzieller Schaden',
      re: w('inkasso|pfändung|zwangsvollstreckung|mahnbescheid|vertragsstrafe|(?:heute|morgen)\\s+(?:noch\\s+)?fällig|frist\\s+läuft\\s+(?:heute|morgen)\\s+ab|(?:heute|morgen)\\s+(?:läuft|endet)\\s+(?:die\\s+)?frist'),
    },
  ];

  const PROBLEM = w('nicht|kein|fehler|falsch|doppelt|gesperrt|defekt|kaputt|absturz|stürzt|abgestürzt|problem|error|bug(?![\\p{L}])|störung|ausgefallen|beschwer');

  // Sätze, die sich an die App richten. Sie sind Inhalt der Anfrage, werden aber
  // weder gewertet noch befolgt, damit sie die Einordnung nicht steuern können.
  const INJECTION = /ignorier|vergiss\p{L}*\s+(?:alle|deine|die|vorherige)|(?:alle|deine|vorherigen?)\s+(?:regeln|anweisungen)|system-?prompt|du\s+bist\s+(?:jetzt|nun)|(?:stufe|setze|bewerte)\s+(?:\S+\s+){0,3}(?:als\s+hoch|auf\s+hoch|dringlichkeit)|ignore\s+(?:all|previous|the)|disregard|(?:antworte|gib)\s+(?:nur|ausschließlich)/iu;

  // Verneinung kurz vor dem Treffer ("nicht gehackt"), sonst würde sie als Alarm zählen.
  const NEGATION_BEFORE = /(?<![\p{L}])(?:kein\p{L}*|nicht|ohne|nie)(?![\p{L}])\s+(?:\S+\s+){0,2}$/iu;

  const NEXT_STEPS = {
    'Zugang': 'Absender per Rückfrage identifizieren, dann Passwort-Reset oder Entsperrung über den regulären Prozess anstoßen und die Rückmeldung abwarten.',
    'Abrechnung': 'Rechnungs- oder Buchungsbeleg beim Absender anfordern, falls nicht beigefügt, und den Fall an die Buchhaltung weitergeben.',
    'Technisches Problem': 'Genaue Fehlermeldung, Gerät oder Browser und die Schritte bis zum Fehler beim Absender erfragen und das Ticket an den technischen Support geben.',
    'Sonstiges': 'Anliegen von Hand lesen und an die zuständige Stelle weitergeben oder direkt beantworten.',
  };

  const NEXT_STEPS_HIGH = {
    sicherheit: 'Sofort an die Sicherheitsverantwortlichen eskalieren, das betroffene Konto vorsorglich sperren lassen und den Absender über einen bereits bekannten Kanal bestätigen.',
    blockade: 'Sofort an den technischen Bereitschaftsdienst eskalieren und dem Absender eine erste Rückmeldung geben.',
    finanziell: 'Noch heute an Buchhaltung oder Teamleitung eskalieren und Zahlungs- sowie Mahnstatus prüfen lassen.',
  };

  const NEXT_STEP_UNCLEAR = 'Rückfrage an den Absender stellen: Worum geht es genau (Zugang, Abrechnung oder technisches Problem)? Was ist passiert, und seit wann? Gibt es eine Fehlermeldung oder einen Beleg?';

  function splitSentences(text) {
    return text.split(/(?<=[.!?])\s+|\n+/).map((s) => s.trim()).filter(Boolean);
  }

  // Liefert immer einen Teilstring des Originals, damit das Zitat wörtlich bleibt.
  function excerpt(sentence, index) {
    if (sentence.length <= QUOTE_MAX) return { quote: sentence, truncated: false };
    const start = Math.max(0, index - 100);
    return { quote: sentence.slice(start, start + QUOTE_MAX).trim(), truncated: true };
  }

  function findTrigger(sentences) {
    for (const sentence of sentences) {
      for (const trigger of TRIGGERS) {
        for (const m of sentence.matchAll(new RegExp(trigger.re.source, 'giu'))) {
          if (!NEGATION_BEFORE.test(sentence.slice(0, m.index))) {
            return { trigger, sentence, match: m[0], index: m.index };
          }
        }
      }
    }
    return null;
  }

  function scoreCategories(sentences) {
    return Object.entries(CATEGORIES).map(([name, concepts]) => {
      let score = 0;
      const hits = [];
      for (const [weight, re] of concepts) {
        for (const sentence of sentences) {
          const m = re.exec(sentence);
          if (m) {
            score += weight;
            hits.push({ weight, sentence, match: m[0], index: m.index });
            break;
          }
        }
      }
      return { name, score, hits };
    });
  }

  function failure(code, message) {
    return { status: 'fehler', code, message };
  }

  function analyze(input) {
    if (typeof input !== 'string' || input.trim() === '') {
      return failure('leer', 'Das Textfeld ist leer. Bitte zuerst eine Supportanfrage einfügen.');
    }
    if (input.length > MAX_LENGTH) {
      return failure(
        'zu-lang',
        `Die Anfrage hat ${input.length.toLocaleString('de-DE')} Zeichen. Erlaubt sind höchstens ${MAX_LENGTH.toLocaleString('de-DE')}. Bitte kürzen und erneut einordnen.`
      );
    }

    const sentences = splitSentences(input);
    const injected = sentences.filter((s) => INJECTION.test(s));
    const content = sentences.filter((s) => !INJECTION.test(s));
    const notes = [];
    if (injected.length) {
      notes.push('Die Anfrage enthält Anweisungen an die App. Sie wurden als Inhalt behandelt, nicht ausgeführt und nicht in die Einordnung einbezogen.');
    }

    const high = findTrigger(content);
    // Stabile Sortierung: Bei Gleichstand steht "Sonstiges" hinten und verliert.
    const ranked = scoreCategories(content).sort((a, b) => b.score - a.score);
    const [top, second] = ranked;
    const tied = top.score > 0 && top.score === second.score && second.name !== 'Sonstiges';
    const decided = top.score >= MIN_SCORE && !tied;

    const fallbackSentence = content[0] || sentences[0];
    const firstHit = ranked.flatMap((r) => r.hits).sort((a, b) => b.weight - a.weight)[0];

    if (!decided) {
      const candidates = ranked.filter((r) => r.score > 0 && r.name !== 'Sonstiges' && r.score === top.score).map((r) => r.name);
      const evidence = high
        ? excerpt(high.sentence, high.index)
        : firstHit
          ? excerpt(firstHit.sentence, firstHit.index)
          : excerpt(fallbackSentence, 0);
      let why;
      if (!content.length) why = 'Die Anfrage besteht nur aus Anweisungen an die App, ein Anliegen ist nicht erkennbar.';
      else if (tied) why = `Mehrere Kategorien passen gleich gut (${ranked.filter((r) => r.score === top.score).map((r) => r.name).join(', ')}).`;
      else if (top.score > 0) why = 'Es gibt nur schwache Hinweise auf eine Kategorie.';
      else why = 'Es wurde kein erkennbares Anliegen gefunden.';

      return {
        status: 'unklar',
        category: 'unklar',
        urgency: high ? 'hoch' : 'unklar',
        urgencyReason: high
          ? `Hoch: ${high.trigger.label} erkannt ("${high.match}").`
          : 'Ohne klares Anliegen lässt sich die Dringlichkeit nicht bestimmen.',
        nextStep: high ? NEXT_STEPS_HIGH[high.trigger.reason] : NEXT_STEP_UNCLEAR,
        quote: evidence.quote,
        truncated: evidence.truncated,
        why,
        candidates,
        signals: [],
        notes,
      };
    }

    const topHit = top.hits.slice().sort((a, b) => b.weight - a.weight)[0];
    const evidence = high ? excerpt(high.sentence, high.index) : excerpt(topHit.sentence, topHit.index);
    const hasProblem = content.some((s) => PROBLEM.test(s));

    let urgency;
    let urgencyReason;
    if (high) {
      urgency = 'hoch';
      urgencyReason = `Hoch: ${high.trigger.label} erkannt ("${high.match}").`;
    } else if (hasProblem) {
      urgency = 'mittel';
      urgencyReason = 'Mittel: Ein Problem wird beschrieben, aber keine komplette Blockade, kein Sicherheitsrisiko und kein unmittelbar drohender finanzieller Schaden.';
    } else {
      urgency = 'niedrig';
      urgencyReason = 'Niedrig: Frage oder Hinweis ohne erkennbares Problem, Blockade, Sicherheitsrisiko oder drohenden Schaden.';
    }

    return {
      status: 'erfolg',
      category: top.name,
      urgency,
      urgencyReason,
      nextStep: high ? NEXT_STEPS_HIGH[high.trigger.reason] : NEXT_STEPS[top.name],
      quote: evidence.quote,
      truncated: evidence.truncated,
      signals: [...new Set(top.hits.map((h) => h.match))],
      candidates: [],
      notes,
    };
  }

  return { analyze, MAX_LENGTH };
});
