# Nova Store — E2E Test Framework

Playwright + TypeScript **Page Object Model** framework for the **deployed**
Nova Store. There is no local application in this repo and no local server is
ever started — the suite points at live URLs.

## Stack

- **Playwright Test** — runner, assertions, fixtures, tracing
- **TypeScript** — typed page objects and data factories
- **Page Object Model** — one class per screen under `src/pages`
- **`data-testid` locators** — restyling the UI does not break tests
- **Reporters** — list + HTML + JUnit (Jenkins) + JSON

## Layout

```
novastore-e2e/
├── src/
│   ├── pages/
│   │   ├── BasePage.ts       # navigation, header, toasts, error detection
│   │   ├── AuthPage.ts       # login / register, customer + admin
│   │   ├── ShopPage.ts       # grid, search, filters, sort, add-to-cart
│   │   ├── CartPage.ts       # cart, checkout, confirmation
│   │   └── AdminPage.ts      # dashboard, orders, catalog, customers
│   ├── fixtures/pageFixtures.ts
│   ├── data/testData.ts      # timestamped users / products / checkout
│   └── utils/
│       ├── env.ts            # environment resolver
│       └── globalSetup.ts    # wakes a sleeping backend once, up front
├── tests/
│   ├── smoke/smoke.spec.ts           # 5 tests  (@smoke)
│   └── regression/regression.spec.ts # 6 tests  (@regression)
├── playwright.config.ts
├── Jenkinsfile
└── .env.example
```

## Setup

```bash
npm ci
npm run install:browsers
```

## Running

```bash
npm test                  # everything, all browsers
npm run test:smoke        # only @smoke
npm run test:regression   # only @regression
npm run test:chromium     # chromium only
npm run test:headed       # watch it run
npm run test:ui           # Playwright UI mode
npm run report            # open the last HTML report
```

## Environments

Targets are pure URL pairs — no servers to boot. Defaults live in
`src/utils/env.ts`; override either value from the shell or Jenkins.

**macOS / Linux**
```bash
ENV=prod npm test
BASE_URL=https://staging.example/app/ API_URL=https://api.staging.example npm test
```

**Windows PowerShell** — `ENV=prod npm test` does **not** work; use:
```powershell
$env:ENV="prod"; npm test
```

**Windows CMD**
```cmd
set ENV=prod && npm test
```

`BASE_URL` must end with a trailing slash. `API_URL` must not.

## Test cases

**Smoke (`@smoke`) — critical path**

| ID | Test |
|---|---|
| SMOKE-01 | storefront loads with products |
| SMOKE-02 | new customer can register |
| SMOKE-03 | admin can log in and reach the dashboard |
| SMOKE-04 | a product can be added to the cart |
| SMOKE-05 | guest completes checkout end-to-end |

**Regression (`@regression`) — deeper coverage**

| ID | Test |
|---|---|
| REG-01 | login fails with invalid credentials |
| REG-02 | duplicate-email registration is rejected |
| REG-03 | product search filters the grid |
| REG-04 | sort by price low-to-high orders ascending |
| REG-05 | admin creates a product and it appears in the store |
| — | coupon SAVE10 reduces the total |

## Jenkins

Create a **Pipeline** job → *Pipeline script from SCM* → point at this repo.
Parameters: **ENV**, **SUITE**, **BROWSER**, plus optional **BASE_URL** /
**API_URL** overrides.

Uses only core steps (`junit`, `archiveArtifacts`), so **no plugins are
required**. The HTML report is archived rather than published inline —
download `playwright-report` from the build page and open `index.html`.

To view reports inside Jenkins instead, install the *HTML Publisher* plugin
and add to the `post { always { ... } }` block:

```groovy
publishHTML(target: [
    reportDir: 'playwright-report',
    reportFiles: 'index.html',
    reportName: 'Playwright Report',
    keepAll: true,
    allowMissing: true,
    alwaysLinkToLastBuild: true
])
```

## Design notes

**URLs are joined explicitly.** `BasePage.open()` builds the target with
string concatenation after stripping any leading slash, rather than relying
on Playwright's `baseURL` resolution. That resolution treats `'/'` as *domain
root*, which silently discards the sub-path when an app is hosted under one —
as GitHub Pages project sites are. With explicit joining, `open()`,
`open('shop')` and `open('/shop')` all behave identically.

**Cold starts are absorbed once.** Free hosting tiers sleep after ~15 minutes
idle and take ~30s to wake. `globalSetup` hits `/api/health` before any test
runs, so that delay is not charged against the first test's timeout.

**Tests run serially.** `workers: 1` and `fullyParallel: false`, because a
deployed environment has one shared dataset. Parallel workers would create
and delete each other's products.

**Data is always unique.** Every user, product and buyer email carries a
timestamp plus a random suffix, so runs never collide and no cleanup step is
needed. Note that regression runs do add real rows to the live store.

**No `networkidle` waits.** Tests wait for specific elements instead.
`networkidle` is deprecated, and against a waking backend it either times out
or resolves before data has arrived.
