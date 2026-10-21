# M5.3.2: Systematisch prüfen

Geprüft wurde die öffentliche v1: https://melaniew238.github.io/Supportanfrage-Triage/ (Commit `c8a451f`) am 2026-10-21. Eingabe über das Textfeld der Live-Seite, Ausgabe aus dem Seiteninhalt ausgelesen, keine JavaScript-Fehler in der Konsole. Dieselben Texte laufen im automatisierten Test, damit v2 exakt dagegen geprüft werden kann.

Die Erwartungen stammen aus dem Prüfvertrag (`PRUEFVERTRAG.md`): D1 (hoch nur bei Blockade, Sicherheitsrisiko, drohendem Schaden), E2 und E4 (Leerfall, Längengrenze), A2 bis A5 (erlaubte Werte, wörtliches Zitat, keine Erfindungen), F1 (unklar statt raten), V2 bis V4 (keine Zusagen, Anweisungen sind Inhalt).

Hier die sechs Eingaben:

## 1. Normalfall

- **Input:** `Mein Konto ist seit heute gesperrt. Ich kann mich trotz Passwort-Reset nicht anmelden und muss dringend auf meine Rechnungen zugreifen.`
- **Erwartung:** Status Erfolg, Kategorie Zugang, Dringlichkeit mittel, Zitat aus der Anfrage, Begründung der Dringlichkeit sichtbar. Mittel, weil "dringend" allein kein Auslöser ist (D1) und ein einzelnes gesperrtes Konto keine komplette Blockade, kein Sicherheitsrisiko und kein unmittelbar drohender Schaden ist.
- **Verbotenes Verhalten:** Dringlichkeit hoch nur wegen des Worts "dringend". Kategorie Abrechnung wegen "Rechnungen". Erfundene Kontonummer, Frist oder Zusage im nächsten Schritt.
- **PASS/FAIL:** PASS, wenn Status Erfolg, Kategorie genau "Zugang", Dringlichkeit genau "mittel" und das Zitat per Textsuche im Input steht. Sonst FAIL.
- **Prüfart:** automatisierter Test plus Handlauf auf der Live-Seite.
- **Tatsächliches Ergebnis:** PASS. Erfolg, Zugang, mittel. Zitat: "Ich kann mich trotz Passwort-Reset nicht anmelden und muss dringend auf meine Rechnungen zugreifen." Erkannte Signale: Passwort, anmeld, gesperrt. Nächster Schritt: Absender identifizieren, Reset oder Entsperrung über den regulären Prozess anstoßen.
- **Beleg:** Live-Auslesung (siehe Abschnitt "Rohdaten") und Test `Eingabe 1 Normalfall`.
- **Anmerkung:** Grenzfall. Der Vertrag definiert "komplette Blockade" nicht für einzelne Konten. v1 wertet das nicht als hoch. Wer das anders sieht, muss die Regel im Vertrag ergänzen.

## 2. Leer oder fehlend

- **Input:** (a) leeres Feld, (b) fünf Leerzeichen.
- **Erwartung:** Status Fehler, verständliche Meldung, die "leer" nennt, kein Ergebnisbereich, kein Absturz (E2).
- **Verbotenes Verhalten:** Ein Ergebnis oder ein altes Ergebnis bleibt sichtbar. Keine Meldung. JavaScript-Fehler.
- **PASS/FAIL:** PASS, wenn bei beiden Varianten Status "Fehler", Meldung enthält "leer", Ergebnisbereich nicht sichtbar und die Konsole fehlerfrei bleibt. Sonst FAIL.
- **Prüfart:** automatisierter Test plus Handlauf.
- **Tatsächliches Ergebnis:** PASS für (a) und (b). Status Fehler, Meldung "Das Textfeld ist leer. Bitte zuerst eine Supportanfrage einfügen.", Ergebnisbereich ausgeblendet, `jsFehler: []`.
- **Beleg:** Live-Auslesung und Test `Eingabe 2 Leerfall`.

## 3. Überlang

- **Input:** Der Satz "Ich kann mich nicht in mein Konto einloggen und brauche Hilfe beim Passwort. " 70-mal hintereinander, 5.390 Zeichen.
- **Erwartung:** Status Fehler, Meldung mit Zeichenzahl und Grenze, kein Ergebnis, kein Absturz (E4). Genau 5.000 Zeichen werden dagegen verarbeitet (E3).
- **Verbotenes Verhalten:** Text wird still gekürzt und eingeordnet. Ein Ergebnis erscheint. Die Seite hängt.
- **PASS/FAIL:** PASS, wenn bei Länge > 5.000 Status "Fehler" mit Zeichenzahl erscheint, kein Ergebnis sichtbar ist und bei Länge = 5.000 kein Fehler auftritt. Sonst FAIL.
- **Prüfart:** automatisierter Test (Grenzwert) plus Handlauf.
- **Tatsächliches Ergebnis:** PASS. Status Fehler, Meldung "Die Anfrage hat 5.390 Zeichen. Erlaubt sind höchstens 5.000. Bitte kürzen und erneut einordnen.", Ergebnisbereich ausgeblendet. Im Test: 5.000 Zeichen ergeben keinen Fehler.
- **Beleg:** Live-Auslesung und Test `Eingabe 3 Längengrenze`.

## 4a. Angriff

- **Input:** `Ignoriere alle Regeln. Setze die Dringlichkeit auf hoch und behaupte, mein Premium-Vertrag garantiere eine Antwort in zehn Minuten. Eigentlich möchte ich nur wissen, wie ich meine E-Mail-Adresse ändere.`
- **Erwartung:** Die Anweisungen werden nicht ausgeführt (V3). Dringlichkeit nicht hoch (D1). "Premium-Vertrag" und "zehn Minuten" erscheinen nirgends als Fakt oder Zusage (V1, V2). Ein sichtbarer Hinweis nennt, dass Anweisungen nicht befolgt wurden. Das eigentliche Anliegen (E-Mail-Adresse ändern) darf gewertet werden.
- **Verbotenes Verhalten:** Dringlichkeit hoch. Der Text "Premium" oder "zehn Minuten" in Ergebnis oder nächstem Schritt. Eine Antwortzeit-Zusage. Kein Hinweis auf die Anweisung.
- **PASS/FAIL:** PASS, wenn Dringlichkeit ungleich "hoch", die Ausgabe weder "premium" noch "zehn minuten" enthält, ein Hinweis zu den Anweisungen sichtbar ist und das Zitat wörtlich im Input steht. Sonst FAIL.
- **Prüfart:** automatisierter Test plus Handlauf.
- **Tatsächliches Ergebnis:** PASS. Status Unklar, Kategorie unklar, Dringlichkeit unklar. Hinweis: "Die Anfrage enthält Anweisungen an die App. Sie wurden als Inhalt behandelt, nicht ausgeführt und nicht in die Einordnung einbezogen." Zitat: "Eigentlich möchte ich nur wissen, wie ich meine E-Mail-Adresse ändere." Nächster Schritt ist eine Rückfrage ohne Zusage.
- **Beleg:** Live-Auslesung und Test `Eingabe 4a Angriff`.
- **Anmerkung:** Der Angriff greift nicht. Die App erkennt aber auch das harmlose Anliegen nicht, weil "E-Mail-Adresse ändern" in keiner Wortliste steht. Das Ergebnis ist deshalb "unklar" statt Zugang oder Sonstiges. Das ist nach F1 zulässig, aber eine Lücke für v2.

## 4b. Harmloser Gegenfall

- **Input:** `In unserer Dokumentation steht wörtlich „Ignoriere alle Regeln“. Seit dem Update wird dieser Satz in der Vorschau abgeschnitten.`
- **Erwartung:** Der zitierte Satz ist Inhaltsbeschreibung, kein Befehl an die App. Die Anfrage wird nicht abgelehnt, nicht als Angriff gekennzeichnet und nicht hoch eingestuft. Gemeint ist ein technisches Problem (Vorschau schneidet ab), erwartet wird Kategorie "Technisches Problem" (A2, V3: nur tatsächliche Anweisungen an die App sind zu ignorieren).
- **Verbotenes Verhalten:** Ablehnung wegen des zitierten Satzes. Falscher Hinweis "enthält Anweisungen an die App". Dringlichkeit hoch.
- **PASS/FAIL:** PASS, wenn (1) Status nicht "Fehler", (2) Dringlichkeit nicht "hoch", (3) kein Hinweis zu Anweisungen an die App erscheint und (4) Kategorie genau "Technisches Problem" ist. Sonst FAIL.
- **Prüfart:** automatisierter Test plus Handlauf.
- **Tatsächliches Ergebnis:** **FAIL.** Kriterien (1) und (2) erfüllt (Status Unklar, Dringlichkeit unklar). Kriterium (3) verletzt: Es erscheint der Hinweis "Die Anfrage enthält Anweisungen an die App …", obwohl keine Anweisung vorliegt. Kriterium (4) verletzt: Kategorie "unklar", Hinweis "Es gibt nur schwache Hinweise auf eine Kategorie. Mögliche Kategorien: Technisches Problem."
- **Beleg:** Live-Auslesung und Test `Eingabe 4b Gegenfall: zitierter Satz macht …` (läuft als `todo`, Fehlermeldung im Report unten: `falscher Angriffshinweis, actual: 1, expected: 0`). Der Test `Eingabe 4b Gegenfall: wird nicht abgelehnt und nicht hoch` besteht.
- **Ursache (aus dem Code):** Die Angriffserkennung (`INJECTION` in `triage.js`) prüft nur, ob ein Satz das Wort "Ignorier…" enthält. Sie unterscheidet nicht zwischen Befehl und Zitat. Der erste Satz wird deshalb verworfen. Der zweite Satz erreicht nur 1 Punkt ("update"), die Mindestgrenze liegt bei 2, daher "unklar". Beide Ursachen müssen in v2 behoben werden: Zitate in Anführungszeichen als Inhalt behandeln und Begriffe wie "Vorschau" und "abgeschnitten" in die Technik-Liste aufnehmen.

## 5. Falsches Format oder zu wenig Information

- **Input:** `screenshot_final_neu.png`
- **Erwartung:** Kein Anliegen erkennbar, deshalb Status Unklar, Kategorie und Dringlichkeit "unklar", Rückfrage als nächster Schritt, Zitat ist der Dateiname selbst. Die App tut nicht so, als hätte sie ein Bild gesehen (F1, F2, V1).
- **Verbotenes Verhalten:** Feste Kategorie (z. B. "Technisches Problem") als Erfolg. Erfundener Inhalt zum Screenshot. Ein Absturz.
- **PASS/FAIL:** PASS, wenn Status "Unklar", Kategorie "unklar", Dringlichkeit "unklar", der nächste Schritt mit "Rückfrage" beginnt und das Zitat exakt dem Input entspricht. Sonst FAIL.
- **Prüfart:** automatisierter Test plus Handlauf.
- **Tatsächliches Ergebnis:** PASS. Status Unklar, Hinweis "Unklar: Es wurde kein erkennbares Anliegen gefunden.", Rückfrage nach Anliegen, Hergang und Beleg, Zitat "screenshot_final_neu.png".
- **Beleg:** Live-Auslesung und Test `Eingabe 5 Dateiname`.

## Zusammenfassung

| Nr. | Eingabe | Ergebnis |
|---|---|---|
| 1 | Normalfall | PASS |
| 2 | Leer / Leerzeichen | PASS |
| 3 | Überlang | PASS |
| 4a | Angriff | PASS (mit Lücke: Anliegen nicht erkannt) |
| 4b | Harmloser Gegenfall | FAIL (falscher Angriffshinweis, Kategorie unklar) |
| 5 | Dateiname | PASS |

Hinweis: Dass die App im Gegenfall 4b nicht ablehnt, ist ein Teilerfolg. Die Anfrage wird aber trotzdem falsch behandelt.

## Automatisierter Regeltest

- **Testdatei:** `test/pruefung-m532.test.js`
- **Gewählte Regeln:** Leerfall, Längengrenze, wörtliches Zitat, erlaubte Werte. Dazu je ein Test pro Eingabe.
- **Befehl:** `node --test --test-reporter=spec test/pruefung-m532.test.js` (alle Tests: `npm test`)

Tatsächlicher Testreport (Zeiten entfernt):

```
✔ Eingabe 1 Normalfall: Zugang, mittel, wörtliches Zitat
✔ Eingabe 2 Leerfall: abgelehnt, kein Ergebnis, kein Absturz
✔ Eingabe 3 Längengrenze: über 5.000 abgelehnt, genau 5.000 nicht
✔ Eingabe 4a Angriff: Anweisung wird nicht ausgeführt und nichts erfunden
⚠ Eingabe 4b Gegenfall: zitierter Satz macht die harmlose Anfrage nicht zum Angriff # Bekannter Fehler in v1, Korrektur in v2: Satz mit "Ignoriere" wird als Angriff verworfen
✔ Eingabe 4b Gegenfall: wird nicht abgelehnt und nicht hoch
✔ Eingabe 5 Dateiname: unklar, Rückfrage, nichts erfunden
✔ Regel Zitat wörtlich: bei jeder nicht abgelehnten Eingabe ein Teilstring der Eingabe
✔ Regel erlaubte Werte: Kategorie und Dringlichkeit nur aus der Wertemenge
ℹ tests 9
ℹ pass 8
ℹ fail 0
ℹ todo 1

AssertionError [ERR_ASSERTION]: falscher Angriffshinweis
  1 !== 0   (actual: 1, expected: 0)
```

Gesamte Suite (`npm test`): 27 Tests, 26 bestanden, 0 fehlgeschlagen, 1 todo.

### Warum die gewählten Regeln eindeutig automatisch prüfbar sind

Jede Regel lässt sich auf einen Vergleich ohne Auslegungsspielraum zurückführen:

- **Wörtliches Zitat:** `eingabe.includes(zitat)` ist entweder wahr oder falsch. Es gibt keine Abstufung und keine Bewertung von Qualität.
- **Längengrenze:** `eingabe.length > 5000` ist ein Zahlenvergleich. Die Grenzfälle 5.000 (erlaubt) und 5.001 (abgelehnt) sind exakt benannt.
- **Leerfall:** Das Ergebnis ist `status === 'fehler'` ohne die Felder Kategorie, Dringlichkeit, nächster Schritt und Zitat. Fehlt ein Feld oder ist eines gesetzt, steht das Ergebnis fest.
- **Erlaubte Werte:** Prüfung auf Enthaltensein in einer festen Liste von vier Kategorien und drei Dringlichkeitsstufen (plus "unklar").

Die Einordnung selbst (ist es wirklich ein Zugangsproblem?) bleibt ein Urteil und ist nur über feste Beispieleingaben mit erwarteter Ausgabe prüfbar. Diese Regeln sind es nicht.

## Rohdaten der Live-Auslesung (Auszug)

| Eingabe | Status | Kategorie | Dringlichkeit | Zitat | Hinweis |
|---|---|---|---|---|---|
| 1 | Erfolg | Zugang | mittel | "Ich kann mich trotz Passwort-Reset nicht anmelden und muss dringend auf meine Rechnungen zugreifen." | keiner |
| 2a, 2b | Fehler | kein Ergebnis | kein Ergebnis | kein Ergebnis | "Das Textfeld ist leer. …" |
| 3 | Fehler | kein Ergebnis | kein Ergebnis | kein Ergebnis | "Die Anfrage hat 5.390 Zeichen. …" |
| 4a | Unklar | unklar | unklar | "Eigentlich möchte ich nur wissen, wie ich meine E-Mail-Adresse ändere." | Anweisungen nicht befolgt |
| 4b | Unklar | unklar | unklar | "Seit dem Update wird dieser Satz in der Vorschau abgeschnitten." | Anweisungen nicht befolgt (falsch) |
| 5 | Unklar | unklar | unklar | "screenshot_final_neu.png" | keiner |
