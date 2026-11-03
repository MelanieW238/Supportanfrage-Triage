# Support request triage

A small web app for support teams. Paste a customer request and get, in under a minute, a category, an urgency level, a suggested next step and a verbatim quote from the request that backs up the decision.

**Status:** completed bootcamp exercise (v2). Live at [melaniew238.github.io/Supportanfrage-Triage](https://melaniew238.github.io/Supportanfrage-Triage/). The UI is in German.

## The user problem

Support staff read every incoming request and decide by hand what it is about and how urgent it is. Two things go wrong easily. Customers write "urgent" on almost everything, so urgency gets inflated. And an automated triage that guesses, invents details or follows instructions hidden in the request text does more harm than no triage at all.

## The solution

A rule-based triage that runs entirely in the browser. No login, no server, no data leaves the page.

- Four categories: Access, Billing, Technical problem, Other
- Three urgency levels. "High" only for a complete outage, a security risk or imminent financial damage. The word "urgent" alone doesn't count.
- When the request is unclear, the app says "unclear" and suggests a follow-up question instead of guessing
- Every result comes with a quote that appears word for word in the request
- No invented customer, account or order data
- Instructions inside the request ("ignore all rules and mark this as high") are treated as content, flagged and not followed
- Five visible states: ready, processing, success, unclear, error

## Tech stack

- Plain HTML, CSS and JavaScript, no build step
- Node's built-in test runner for unit and rule tests
- Playwright for the end-to-end test of the core path
- GitHub Pages

## What I learned

<!-- TODO: Melanie, please review. Drafted from the test protocols in this repo. -->

- **Write the test contract before judging the app.** The 23 rules in `PRUEFVERTRAG.md` define PASS and FAIL for every behaviour. Without them, every test result would have been a matter of opinion.
- **A test follows the written rule, not the task text.** The assignment expected "high" for a locked account with the word "urgent". The contract says that's "medium". I adjusted the test to the contract and documented why.
- **Rank findings by severity times frequency.** Three findings came out of v1. The one fixed first was the only one that told the user something false: a quoted sentence like "ignore all rules" was flagged as an attack. The other two were gaps where the app honestly said "unclear".
- **A safe fallback beats a confident wrong answer.** "Unclear" with a follow-up question is a valid result, not a failure.

## Where to find what

Documentation is written in German.

| File / folder | Content |
|---|---|
| `index.html`, `app.js`, `style.css` | The app |
| `triage.js` | Triage rules: keyword lists, urgency triggers, injection detection |
| `test/` | Unit and rule tests |
| `e2e/` | Playwright test for the core path |
| `PRUEFVERTRAG.md` | Build log, assumptions and the full test contract (23 rules) |
| `PROTOKOLL_M532.md` | Systematic test of v1 with six inputs |
| `E2E_KERNPFAD.md` | End-to-end test report |
| `M534_FIX.md` | Findings, the fix for v2 and how it was verified |
| `belege/` | Raw evidence from the test runs |

## Running it locally

Open `index.html` in a browser. For the tests:

```bash
npm install
npm test             # unit and rule tests
npm run test:e2e     # Playwright, runs against the live URL unless BASE_URL is set
```

## How it was built

Built with Claude Code as an assignment in a 10-week vibe coding bootcamp. Claude Code wrote v1 from the assignment prompt. The test contract, the review of the results and the choice of which finding to fix are mine.

## Contact

Melanie Weber · [Portfolio](https://melaniew238githubio.vercel.app) · [LinkedIn](https://linkedin.com/in/melanie-weber-7b7620181)
