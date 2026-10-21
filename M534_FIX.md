# M5.3.4: Einen Fix bis zur v2 prüfen

## 1. Befunde aus den tatsächlichen Läufen

Quellen: Live-Läufe der sieben Eingaben auf der v1-URL (1, 2a, 2b, 3, 4a, 4b, 5), die Unit- und Regeltests (`test/`) und der Playwright-Kernpfad (`e2e/`). Kein zusätzlicher Test mit einer anderen Person, die Prüfung der fremden Person aus M5.3.1 ist weiterhin offen.

Bewertung:

- Schweregrad 1: Lücke mit sicherem Rückfall. Die App sagt "unklar", nichts Falsches wird behauptet.
- Schweregrad 2: falsche oder irreführende Ausgabe ohne Schaden.
- Schweregrad 3: Sicherheitsproblem, erfundene Daten, falsche Eskalation oder Ablehnung. Bleibt kritisch, auch wenn es nur einmal auftritt.
- Häufigkeit: Anzahl der betroffenen Live-Eingaben von sieben. Der Score ist Schweregrad mal Häufigkeit.

| Nr. | Beobachtung | Betroffene Läufe | Schweregrad | Score |
|---|---|---|---|---|
| B1 | Eingabe 4b (harmloser Gegenfall mit zitiertem „Ignoriere alle Regeln“): Die App zeigt den Hinweis "Die Anfrage enthält Anweisungen an die App", obwohl keine vorliegt, und verwirft den Satz aus der Wertung. | 1 von 7 (Live) | 2: irreführender Hinweis an die Support-Person, Inhalt geht verloren | 2 |
| B2 | Eingabe 4b: Kategorie bleibt "unklar", erwartet war "Technisches Problem". "Vorschau" und "abgeschnitten" stehen in keiner Wortliste, "update" allein ergibt nur 1 Punkt (Minimum 2). | 1 von 7 (Live) | 1: sicherer Rückfall | 1 |
| B3 | Eingabe 4a: Das eigentliche Anliegen "E-Mail-Adresse ändern" wird nicht erkannt, Ergebnis "unklar". | 1 von 7 (Live) | 1: sicherer Rückfall | 1 |

Kein Sicherheitsproblem und keine Schweregrad-3-Befunde: Der Angriff in 4a wurde in keinem Lauf ausgeführt, es erschien keine erfundene Zusage und kein "hoch" durch eine Anweisung.

Nicht als Befund gezählt:

- Der Normalfall ergibt "mittel", der Aufgabentext von M5.3.3 nannte "hoch". Das war eine Abweichung zwischen Aufgabe und Prüfvertrag (Regel D1), entschieden zugunsten des Vertrags. Kein Fehler der App.
- Eigene Fehler beim Testen (falscher Pfad `goto('/')`, ein falscher Satz im Prüfvertrag zur Verneinung) wurden im jeweiligen Lauf behoben und betreffen nicht das Produkt.

### Warum B1 zuerst kommt

- Höchster Score (2 gegen je 1).
- B1 ist die einzige Ausgabe, die der Nutzerin etwas Falsches mitteilt. B2 und B3 sind Lücken, bei denen die App ehrlich "unklar" sagt.
- B1 sitzt in der Sicherheitsprüfung (Angriffserkennung). Wer dort Zitate nicht von Befehlen unterscheidet, wirft legitimen Text weg.
- B1 verdeckt B2: Solange der erste Satz von 4b verworfen wird, lässt sich nicht sauber beurteilen, was an der Wortliste fehlt.

## 2. Der Fix für B1

Symptom:
Bei der Eingabe `In unserer Dokumentation steht wörtlich „Ignoriere alle Regeln“. Seit dem Update wird dieser Satz in der Vorschau abgeschnitten.` erscheint der Hinweis "Die Anfrage enthält Anweisungen an die App. Sie wurden als Inhalt behandelt, nicht ausgeführt und nicht in die Einordnung einbezogen." Der erste Satz geht nicht in die Wertung ein.

Vermutete Ursache:
`INJECTION` in `triage.js` prüft jeden Satz auf Muster wie "ignorier…" und unterscheidet nicht, ob der Satz eine Anweisung ausspricht oder eine zitiert. Der Satz mit dem Zitat in Anführungszeichen wird deshalb als Angriff markiert.

Genau eine umgesetzte Änderung:
Vor der Angriffserkennung wird Text in Anführungszeichen („…“, "…", »…«) aus dem Satz entfernt (`triage.js`, Konstante `QUOTED` und Funktion `isInjection`). Keine Änderung an Oberfläche, Wortlisten, Texten oder Dringlichkeitsregeln. Dazu ein Kommentar, weil die Stelle sicherheitsrelevant ist.

Die einzige weitere Änderung außerhalb der App-Logik: `playwright.config.js` liest optional `BASE_URL`, damit der Browser-Test auch gegen die lokale v2 laufen kann. Standard bleibt die öffentliche URL.

Risiko des Fixes: Eine Anweisung in Anführungszeichen löst keinen Hinweis mehr aus. Ausgeführt wird sie nie, das sichert der Test `Anweisung in Anführungszeichen wird trotzdem nie ausgeführt`. Enthält ein Zitat selbst Satzzeichen (`„A. B“`), wird es vor der Prüfung in Sätze zerlegt und der Schutz greift nicht. Das ist eine bekannte Grenze.

Regression vor Fix: **FAIL**
Test `Regression B1, Eingabe 4b: zitierter Satz löst keinen Angriffshinweis aus` gegen die unveränderte v1 (`triage.js` identisch zu Commit `c8a451f`), Beleg `belege/m534/1-vor-fix.txt`:

```
✖ Regression B1, Eingabe 4b: zitierter Satz löst keinen Angriffshinweis aus
  AssertionError [ERR_ASSERTION]: falscher Angriffshinweis
    actual: 1,
    expected: 0,
ℹ tests 29
ℹ pass 27
ℹ fail 1
ℹ todo 1
```

Nach Fix: **PASS**
Beleg `belege/m534/2-regression-nach-fix.txt`:

```
✔ Regression B1, Eingabe 4b: zitierter Satz löst keinen Angriffshinweis aus
✔ Eingabe 4b Gegenfall: Anweisung in Anführungszeichen wird trotzdem nie ausgeführt
✔ Eingabe 4b Gegenfall: wird nicht abgelehnt und nicht hoch
```

Ausgabe der App für 4b vorher und nachher (`belege/m534/5-4a-4b-nach-fix.txt`):

| | Vorher (v1) | Nachher (lokale v2) |
|---|---|---|
| Hinweis "Anweisungen an die App" | ja (falsch) | nein |
| Kategorie | unklar | unklar (offen, siehe B2) |
| Banner | "nur schwache Hinweise, mögliche Kategorien: Technisches Problem" | gleich, jetzt ohne Hinweis zu Anweisungen und mit beiden Sätzen in der Wertung |

Zur Kontrolle: 4a (der echte Angriff) zeigt weiterhin den Hinweis (`Hinweise: 1`), Dringlichkeit unklar, nichts ausgeführt.

## 3. Gesamte Suite

| Gruppe | Prüfung | Ergebnis | Beleg |
|---|---|---|---|
| 1 Normalfall | `Eingabe 1 Normalfall` | PASS | `3-suite-unit.txt` |
| 2 Leer | `Eingabe 2 Leerfall` | PASS | `3-suite-unit.txt` |
| 3 Überlang | `Eingabe 3 Längengrenze` | PASS | `3-suite-unit.txt` |
| 4 Angriff und Gegenfall | `4a Angriff` PASS, `Regression B1` PASS, `4b nicht abgelehnt und nicht hoch` PASS, `4b Anführungszeichen` PASS, `4b Kategorie` offen (todo, B2) | PASS mit 1 offenem Punkt | `3-suite-unit.txt` |
| 5 Dateiname | `Eingabe 5 Dateiname` | PASS | `3-suite-unit.txt` |
| Regeltests | Zitat wörtlich, erlaubte Werte, Leerfall, Längengrenze, 18 Unit-Tests aus der v1 | PASS | `3-suite-unit.txt` |
| Browser-Kernpfad, lokale v2 | Playwright, 3 Läufe | PASS (3 passed) | `4-e2e-lokal-v2.txt` |
| Browser-Kernpfad, öffentliche v2 | Playwright und Handlauf | OFFEN bis zur Veröffentlichung | siehe unten |

Gesamtergebnis `npm test`: 29 Tests, 28 bestanden, 0 fehlgeschlagen, 1 todo (B2).

## 4. v2-URL

**OFFEN.** Die v2 ist lokal fertig und getestet, aber nicht veröffentlicht und nicht committet. Gepusht wird laut Projektregel von dir. Sobald die v2 auf GitHub Pages liegt, trage ich die URL hier ein und führe auf ihr den Browser-Kernpfad (Playwright) und die Eingaben 4a und 4b aus.

Die bisherigen Belege gelten nur für die lokale Version. Ob die öffentliche v2 das Gleiche tut, ist bis dahin nicht bewiesen.

## 5. Verbleibende Befunde

1. **B2** (Score 1): 4b bleibt "unklar" statt "Technisches Problem". Nächste kleine Änderung: Wörter wie "Vorschau" und "abgeschnitten" in die Technik-Wortliste. Test existiert als `todo` und wird dann zum normalen Test.
2. **B3** (Score 1): "E-Mail-Adresse ändern" wird in 4a nicht erkannt. Nächste kleine Änderung: Eintrag in der Wortliste für Zugang oder Sonstiges, zuerst klären, wohin die Anfrage gehört.

Offene Annahme, nicht beobachtet: Die Wortlisten sind klein. Mit echten Anfragen sind weitere Lücken zu erwarten, das zeigen erst Läufe mit anderen Personen.
