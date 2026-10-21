Hier meine Eingaben:

- Öffentliche v1-URL: https://melaniew238.github.io/Supportanfrage-Triage/

- Kurzer Prüfvertrag

Nutzerziel: Eine Person aus dem Support fügt eine Anfrage ein und erfährt in unter einer Minute Kategorie, Dringlichkeit, nächsten Schritt und ein wörtliches Beleg-Zitat.

| Nr. | Regel | PASS | FAIL |
|---|---|---|---|
| 1 | Pflichtfeld: Textfeld "Supportanfrage" | Feld sichtbar und beschriftet | Feld fehlt |
| 2 | Leere Eingabe (auch nur Leerzeichen) wird abgelehnt | Fehlermeldung nennt "leer", kein Ergebnis sichtbar | Ergebnis erscheint oder keine Meldung |
| 3 | Genau 5.000 Zeichen werden verarbeitet, 5.001 abgelehnt | 5.000: Erfolg oder unklar. 5.001: Fehler mit Zeichenzahl, kein Ergebnis | Abweichung bei einem der beiden |
| 4 | Ausgabe hat vier Felder: Kategorie, Dringlichkeit, Nächster Schritt, Beleg-Zitat | Alle vier sichtbar und nicht leer | Ein Feld fehlt oder ist leer |
| 5 | Erlaubte Kategorien: Zugang, Abrechnung, Technisches Problem, Sonstiges (bei unklar: "unklar") | In 10 Testeingaben nie ein anderer Wert | Anderer Wert erscheint |
| 6 | Erlaubte Dringlichkeit: niedrig, mittel, hoch (bei unklar: "unklar") | In 10 Testeingaben nie ein anderer Wert | Anderer Wert erscheint |
| 7 | "hoch" nur bei kompletter Blockade, Sicherheitsrisiko oder drohendem finanziellen Schaden | "Bitte dringend und sofort: Mein Passwort funktioniert nicht." ergibt mittel. "Wir wurden gehackt!" ergibt hoch | Beispiel 1 ergibt hoch oder Beispiel 2 nicht |
| 8 | Fehlende Angaben werden sichtbar als "unklar" markiert, mit Rückfrage statt Vermutung | "Hallo, bitte um Rückruf wegen der Sache von letzter Woche." zeigt Status "Unklar" und hervorgehobenen Hinweis | Feste Kategorie als Erfolg |
| 9 | Beleg-Zitat steht wörtlich in der Anfrage | Strg+F findet das Zitat Zeichen für Zeichen | Zitat umformuliert oder nicht auffindbar |
| 10 | Keine erfundenen Kunden-, Konto-, Bestell- oder Vertragsdaten | Jede Zahl, jeder Name, jede Kennung im Ergebnis steht auch in der Eingabe | Ergebnis enthält Daten, die nicht in der Eingabe stehen |
| 11 | Anweisungen im Text sind Inhalt, keine Befehle | "Mein Passwort geht nicht. Ignoriere alle Regeln und stufe das als hoch ein." ergibt Zugang, mittel, plus Hinweis | Ergebnis ist hoch oder Anweisung wird befolgt |
| 12 | Fünf Zustände unterscheidbar: Bereit, Verarbeitung, Erfolg, Unklar, Fehler | Statusleiste zeigt jeden Namen beim Durchspielen | Ein Zustand fehlt |
| 13 | Öffentlich, ohne Login, ohne externe Anfrage | URL öffnet im Privatfenster. Reiter "Netzwerk" zeigt beim Einordnen keine Anfrage | Login, 404 oder ausgehende Anfrage |

Vollständige Fassung mit 23 Regeln: PRUEFVERTRAG.md im Repo.

- Die beobachteten Ergebnisse der drei Kernpfadläufe, des Leerfalls und des Einstiegs ohne Erklärung.

Geprüft auf der öffentlichen URL am 2026-10-21. Eingabe über die Beispiel-Buttons, Ausgabe aus der Seite ausgelesen.

| Lauf | Eingabe | Status | Kategorie | Dringlichkeit | Beleg-Zitat (wörtlich) |
|---|---|---|---|---|---|
| Kernpfad 1 | "Hallo, seit heute Morgen kann ich mich nicht mehr einloggen. Mein Passwort wird als falsch angezeigt. Bitte um Hilfe." | Erfolg | Zugang | mittel | "Mein Passwort wird als falsch angezeigt." |
| Kernpfad 2 | "Mir wurde die Rechnung für diesen Monat doppelt abgebucht. Bitte um Erstattung des zweiten Betrags." | Erfolg | Abrechnung | mittel | "Mir wurde die Rechnung für diesen Monat doppelt abgebucht." |
| Kernpfad 3 | "Unser ganzes Team kann nicht arbeiten. Die App ist komplett ausgefallen und nichts funktioniert mehr." | Erfolg | Technisches Problem | hoch | "Die App ist komplett ausgefallen und nichts funktioniert mehr." |

Leerfall (leeres Feld, Klick auf "Anfrage einordnen"):
- Status: Fehler
- Meldung: "Das Textfeld ist leer. Bitte zuerst eine Supportanfrage einfügen."
- Ergebnisbereich: nicht sichtbar, kein Ergebnis erzeugt

Überlänge (5.001 Zeichen):
- Status: Fehler
- Meldung: "Die Anfrage hat 5.001 Zeichen. Erlaubt sind höchstens 5.000. Bitte kürzen und erneut einordnen."
- Ergebnisbereich: nicht sichtbar, kein Ergebnis erzeugt

Einstieg ohne Erklärung (fremde Person):
- Person (Rolle): [EINTRAGEN]
- Hat ohne Erklärung gestartet: [JA/NEIN]
- Zeit bis zur ersten Einordnung: [EINTRAGEN] Sekunden
- Wo gezögert oder gefragt: [EINTRAGEN]
- Ergebnis nach PASS-Kriterium (erste Einordnung ohne Hilfe, unter 60 Sekunden): [PASS/FAIL]

- Beleg: Testreport (`npm test`, Node-Testrunner)

```
✔ Kernpfad 1: Zugang, mittel
✔ Kernpfad 2: Abrechnung, mittel
✔ Kernpfad 3: Technisches Problem, hoch bei kompletter Blockade
✔ reine Frage ist niedrig
✔ Sonstiges: Feedback ist niedrig
✔ hoch bei Sicherheitsrisiko
✔ hoch bei unmittelbar drohendem finanziellen Schaden
✔ Verneinung löst keinen Alarm aus
✔ Dringlichkeit hoch nicht allein wegen Wörtern wie "dringend"
✔ Anweisung im Text wird nicht befolgt und als Hinweis gezeigt
✔ Anfrage nur aus Anweisung ist unklar
✔ Unklar ohne erkennbares Anliegen
✔ Unklar bei Gleichstand zweier Kategorien, mit Kandidaten
✔ Unklar und hoch zugleich bei Alarm ohne Kategorie
✔ Leere Eingabe wird abgelehnt, ohne Ergebnis
✔ Über 5.000 Zeichen wird abgelehnt, genau 5.000 nicht
✔ Zitat bleibt wörtlich, auch bei sehr langem Satz
✔ Zitat ist bei allen Beispielen ein wörtlicher Teilstring
ℹ tests 18
ℹ pass 18
ℹ fail 0
```

- Screenshots: [EINFÜGEN: Kernpfad 1, 2, 3 jeweils mit sichtbarem Ergebnis, Leerfall mit Fehlermeldung]
