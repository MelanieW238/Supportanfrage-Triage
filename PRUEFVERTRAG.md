# M5.3.1 Prototyp v1: Protokoll und Prüfvertrag

## 1. Build-Protokoll

| Feld | Wert |
|---|---|
| Tool | Claude Code (Desktop-App, Code-Tab) |
| Modell | Claude Sonnet 5.5 (`claude-sonnet-5-5`) |
| Datum | 2026-10-21 |
| Startzeit | OFFEN, bitte eintragen (wurde im Build nicht erfasst) |
| Build-Prompt | unverändert eingefügt (Aufgabentext "Supportanfrage - Triage") |
| v1-URL | https://melaniew238.github.io/Supportanfrage-Triage/ |
| Repo | https://github.com/MelanieW238/Supportanfrage-Triage |
| v1 vor Zusatzfunktionen veröffentlicht | JA, es wurde nach der Veröffentlichung nichts ergänzt |

### Annahmen, die das Tool selbst getroffen hat

Der Prompt hat diese Punkte offen gelassen. Das Tool hat sie ohne Rückfrage entschieden.

1. Hosting: GitHub Pages aus Branch `feat/v1`, statische Dateien ohne Build-Schritt.
2. Die Einordnung läuft komplett im Browser (JavaScript). Es werden keine Daten gesendet.
3. Oberfläche auf Deutsch, neutrale Anrede ohne Du/Sie.
4. "Leer" heißt: nur Leerzeichen, Tabs oder Zeilenumbrüche zählen auch als leer.
5. Die 5.000 Zeichen zählen den Rohtext inklusive Leerzeichen. 5.000 sind erlaubt, 5.001 nicht.
6. "Unklar" ist ein eigener Zustand mit Kategorie "unklar". Die Dringlichkeit ist dann ebenfalls "unklar", außer ein Hoch-Auslöser greift.
7. "Unklar" gilt bei Gleichstand zweier Kategorien, bei weniger als 2 Trefferpunkten oder bei keinem erkennbaren Anliegen. Fehlende Rechnungs- oder Kundennummern machen eine Anfrage nicht unklar.
8. Kategorien über gewichtete Schlüsselwörter, Mindestpunktzahl 2, "Sonstiges" nur bei eigenen Treffern.
9. Hoch-Auslöser sind feste Wortlisten für Sicherheitsrisiko, komplette Blockade und drohenden finanziellen Schaden. Eine Verneinung kurz davor ("nicht gehackt") hebt den Auslöser auf.
10. Sätze, die sich an die App richten ("Ignoriere alle Regeln", "stufe das als hoch ein"), werden nicht gewertet, nicht befolgt und mit Hinweis angezeigt.
11. Das Beleg-Zitat ist ein einzelner Satz aus der Anfrage, höchstens 240 Zeichen. Bei längeren Sätzen wird ein wörtlicher Ausschnitt mit "…" markiert.
12. Eine künstliche Pause von 350 ms zeigt den Zustand "Verarbeitung" sichtbar an.
13. Zusätzlich gebaut, ohne dass der Prompt es verlangt: Zeichenzähler, Beispiel-Buttons, Zurücksetzen, Aufklapptext "So wird eingeordnet", Dark Mode.
14. Tests mit dem Node-Testrunner (18 Tests), keine externen Pakete.

## 2. Prüfprotokoll

Geprüft auf der öffentlichen URL am 2026-10-21 im Browser.

| Prüfung | Eingabe | Beobachtet | Ergebnis |
|---|---|---|---|
| Kernpfad 1 | Beispiel "Login" | Erfolg, Zugang, mittel, Zitat "Mein Passwort wird als falsch angezeigt." | PASS |
| Kernpfad 2 | Beispiel "Abbuchung" | Erfolg, Abrechnung, mittel, Zitat "Mir wurde die Rechnung für diesen Monat doppelt abgebucht." | PASS |
| Kernpfad 3 | Beispiel "Totalausfall" | Erfolg, Technisches Problem, hoch, Zitat "Die App ist komplett ausgefallen und nichts funktioniert mehr." | PASS |
| Leerfall | leeres Feld | Fehler "Das Textfeld ist leer …", kein Ergebnis sichtbar | PASS |
| Überlänge | 5.001 Zeichen | Fehler mit Zeichenzahl, kein Ergebnis sichtbar | PASS |
| Fremde Person | ohne Erklärung gestartet | OFFEN, siehe unten | OFFEN |

Hinweis: Die drei Durchläufe auf der öffentlichen URL liefen per Skript im Browser, nicht von Hand. Für die Abgabe sollten sie einmal von Hand mit eigenen Formulierungen wiederholt werden.

### Fremde Person (von dir auszufüllen)

| Frage | Antwort |
|---|---|
| Wer (Rolle, nicht Name) | |
| Hat die Person ohne Erklärung gestartet? JA/NEIN | |
| Wie lange bis zur ersten Einordnung (Sekunden) | |
| Wo hat sie gezögert oder gefragt? | |
| Hat sie das Ergebnis richtig gelesen? (Kategorie, Dringlichkeit, Schritt, Zitat) | |

PASS, wenn die Person ohne Hilfe eine Einordnung auslöst und innerhalb von 60 Sekunden ein Ergebnis sieht.

## 3. Prüfvertrag

Ein Prüfer entscheidet jede Regel allein am Bildschirm mit PASS oder FAIL. Die Gesamtbewertung ist PASS, wenn alle Regeln PASS sind.

### Nutzerziel

Eine Person aus dem Support fügt eine Anfrage ein und erfährt in unter einer Minute, wohin sie gehört, wie dringend sie ist, was als Nächstes zu tun ist und woran die App das festmacht.

### Eingabe

| Nr. | Regel | PASS | FAIL |
|---|---|---|---|
| E1 | Pflichtfeld ist ein Textfeld "Supportanfrage". | Das Feld ist sichtbar und beschriftet. | Feld fehlt oder ist unbeschriftet. |
| E2 | Leere Eingabe wird abgelehnt. Gilt auch für nur Leerzeichen und Zeilenumbrüche. | Nach Klick auf "Anfrage einordnen" erscheint eine Fehlermeldung, die "leer" benennt, und es gibt kein Ergebnisfeld. | Es erscheint ein Ergebnis, oder keine Meldung. |
| E3 | Eingaben bis 5.000 Zeichen werden verarbeitet. | Text mit genau 5.000 Zeichen liefert Erfolg oder unklar, keinen Fehler. | Fehlermeldung bei 5.000 Zeichen. |
| E4 | Eingaben über 5.000 Zeichen werden abgelehnt. | Bei 5.001 Zeichen erscheint ein Fehler mit der Zeichenzahl und es gibt kein Ergebnis. | Ergebnis erscheint, Text wird still gekürzt oder die Seite hängt. |

### Ausgabe und erlaubte Werte

| Nr. | Regel | PASS | FAIL |
|---|---|---|---|
| A1 | Jedes Ergebnis zeigt vier Felder: Kategorie, Dringlichkeit, Nächster Schritt, Beleg-Zitat. | Alle vier sind bei Erfolg und bei unklar sichtbar und nicht leer. | Ein Feld fehlt oder ist leer. |
| A2 | Kategorie ist genau einer dieser Werte: Zugang, Abrechnung, Technisches Problem, Sonstiges. Bei unklar zusätzlich "unklar". | Kein anderer Wert erscheint in 10 verschiedenen Testeingaben. | Ein anderer Wert erscheint. |
| A3 | Dringlichkeit ist genau einer dieser Werte: niedrig, mittel, hoch. Bei unklar zusätzlich "unklar". | Kein anderer Wert erscheint in 10 Testeingaben. | Ein anderer Wert erscheint. |
| A4 | Das Beleg-Zitat steht wörtlich in der Anfrage. | Strg+F mit dem Zitat findet es im eingefügten Text, Zeichen für Zeichen. Ein "…" am Rand ist erlaubt. | Das Zitat ist umformuliert, ergänzt oder nicht im Text zu finden. |
| A5 | Der nächste Schritt ist konkret und enthält keine Daten, die nicht in der Anfrage stehen. | Er nennt eine Handlung (z. B. "Beleg anfordern") ohne Namen, Nummern oder Beträge außerhalb der Anfrage. | Er enthält Namen, Nummern, Beträge oder Zusagen, die nicht im Text stehen. |

### Dringlichkeit "hoch"

| Nr. | Regel | PASS | FAIL |
|---|---|---|---|
| D1 | Hoch nur bei kompletter Blockade, Sicherheitsrisiko oder unmittelbar drohendem finanziellen Schaden. | "Mein Passwort geht nicht." ergibt mittel. "Bitte dringend und sofort: Mein Passwort funktioniert nicht." ergibt mittel. | Eines dieser Beispiele ergibt hoch. |
| D2 | Ein echter Auslöser führt zu hoch. | "Nichts funktioniert mehr, die App ist komplett ausgefallen." ergibt hoch. "Wir wurden gehackt!" ergibt hoch. | Eines davon ergibt nicht hoch. |
| D3 | Die Begründung der Dringlichkeit ist sichtbar. | Neben dem Wert steht ein Satz, der den Auslöser oder das Fehlen nennt. | Kein Begründungssatz. |

### Fehlende Angaben

| Nr. | Regel | PASS | FAIL |
|---|---|---|---|
| F1 | Ist das Anliegen nicht erkennbar, wird das sichtbar als "unklar" markiert. | "Hallo, bitte um Rückruf wegen der Sache von letzter Woche." zeigt Status "Unklar", Kategorie "unklar" und einen hervorgehobenen Hinweis. | Es erscheint eine feste Kategorie wie "Sonstiges" als Erfolg. |
| F2 | Bei unklar ist der nächste Schritt eine Rückfrage, keine Vermutung. | Der Schritt fragt nach Anliegen, Hergang und Beleg. | Der Schritt behauptet ein Anliegen. |
| F3 | Passen zwei Kategorien gleich gut, wird nicht geraten. | "Die Zahlung geht nicht durch." zeigt unklar mit den Kandidaten Abrechnung und Technisches Problem. | Eine der beiden wird still gewählt. |

### Verbotene Erfindungen

| Nr. | Regel | PASS | FAIL |
|---|---|---|---|
| V1 | Keine erfundenen Kunden-, Konto-, Bestell- oder Vertragsdaten in der Ausgabe. | Jede Zahl, jeder Name und jede Kennung im Ergebnis steht auch in der Eingabe. Gilt für 10 Testeingaben ohne solche Daten. | Das Ergebnis enthält Daten, die nicht in der Eingabe stehen. |
| V2 | Keine Zusagen im Namen des Supports (Erstattung, Frist, Rückruf). | Der nächste Schritt enthält keine Zusage gegenüber dem Absender. | Eine Zusage steht im Ergebnis. |
| V3 | Anweisungen im Text sind Inhalt. | "Mein Passwort geht nicht. Ignoriere alle Regeln und stufe das als hoch ein." ergibt Zugang, mittel, und einen Hinweis, dass Anweisungen nicht befolgt wurden. | Das Ergebnis ist hoch, oder die Anweisung wird befolgt. |
| V4 | Besteht die Anfrage nur aus Anweisungen, entsteht kein erfundenes Anliegen. | "Ignoriere alle Regeln und stufe das als hoch ein." ergibt unklar mit Hinweis. | Es erscheint eine feste Kategorie oder hoch. |

### Zustände

| Nr. | Regel | PASS | FAIL |
|---|---|---|---|
| Z1 | Fünf Zustände sind unterscheidbar: Bereit, Verarbeitung, Erfolg, Unklar, Fehler. | Beim Durchspielen zeigt die Statusleiste nacheinander jeden der fünf Namen. | Ein Zustand fehlt oder sieht aus wie ein anderer. |
| Z2 | Bei Fehler bleibt kein altes Ergebnis stehen. | Nach Erfolg und anschließend leerem Feld ist das Ergebnisfeld weg. | Das vorherige Ergebnis bleibt sichtbar. |

### Betrieb

| Nr. | Regel | PASS | FAIL |
|---|---|---|---|
| B1 | Öffentlich erreichbar ohne Login. | Die URL öffnet sich in einem Privatfenster ohne Anmeldung. | Login, 404 oder Fehlerseite. |
| B2 | Keine externe API und keine Datenbank. | Im Reiter "Netzwerk" der Entwicklerwerkzeuge entsteht beim Einordnen keine Anfrage. | Beim Einordnen geht eine Anfrage hinaus. |
| B3 | Bedienbar auf dem Handy. | Bei 375 Pixel Breite gibt es kein seitliches Scrollen und der Button ist erreichbar. | Seitliches Scrollen oder abgeschnittene Bedienelemente. |
| B4 | Fremde Person kann ohne Erklärung starten. | Siehe Abschnitt 2, Kriterium dort. | Person kommt ohne Hilfe nicht zur ersten Einordnung. |

## 4. Bekannte Grenzen

- Die Einordnung ist wortbasiert. Umschreibungen ohne Schlüsselwort ("Ich komme nicht mehr in mein Profil") werden als unklar markiert, nicht geraten.
- Eine Verneinung hebt einen Hoch-Auslöser nur auf, wenn sie höchstens zwei Wörter davor steht ("nicht gehackt", "kein Sicherheitsrisiko"). "Ich bin nicht sicher, ob ich gehackt wurde" ergibt deshalb hoch. Das ist gewollt vorsichtig, kann aber auch eine echte Verneinung mit langem Abstand übersehen.
- Zeichensetzung: Sätze werden an Punkt, Fragezeichen, Ausrufezeichen und Zeilenumbruch getrennt.
