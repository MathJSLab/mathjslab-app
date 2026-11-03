# Published package alignment — 2026-11-02

The installed registry packages are `mathjslab@2.10.0` and
`mathjslab-markdown@0.10.0`. The Markdown package's `mathjslab` peer resolves
to the same deduplicated installation as the app. Public runtime declarations,
the browser executor and actual document Workers were checked against these
installed packages; no sibling core/Markdown checkout was changed.

## SESSION_BUSY regression

`install:all` runs the organization clean/copy workflow. Its shared prompt-list
component had synchronous `promptAdd` / `promptLoadEval` implementations. They
started every asynchronous RuntimeSession command without awaiting completion.
The first `clear` occupied the session while all remaining startup commands
were rejected by the app's busy guard. The guard was correctly protecting the
workspace; the caller was scheduling commands concurrently.

The correction has two boundaries:

- `PromptSequence.ts` owns the application's ordered execution, awaiting each
  evaluator before adding the next command. Empty editor rows remain empty and
  the caller's source list is preserved. `CommandWorkspace` uses this scheduler
  independently of the shared component's batch implementation.
- The shared component now accepts synchronous or Promise-returning handlers,
  awaits evaluation, and refreshes interactive prompt state after completion.
  The identical component was mirrored into
  `mathjslab-github/src/components/command-prompt-list/command-prompt-list.component.ts`.

Synchronization also removed earlier app-specific plot cleanup hooks from the
generic components. Plot resources now observe their containing composed DOM
roots and release themselves when cleared or disconnected, including nested
shadow trees. This remains app-owned and adds no app imports to shared UI code.

The organization manifest already selects the corrected shared source. Its
input, published copy and local app copy remain byte-identical. The real
clean/copy replay preserved 11 app-owned files and copied 100 shared resources.
App-owned runtime scheduling and resource ownership are protected by boundary
checks and are not synchronized from the organization.

## Published numeric contract

The installed 2.10.0 contract supports changing the backend through `configure`
while preserving workspace values. Existing app changes following that contract
were retained, including execution-only session controls and no host numeric
selectors. Browser checks cover backend changes with matrices and closures, and
independent configuration in prompt and Markdown sessions.

## Validation

- Development Webpack compilation passed with the registry packages. The
  isolated output is `report/registry-dev`; app/Worker build input fingerprints
  match the installed core and Markdown adapter.
- 14 Chromium cases passed against that development build, with zero retries:
  all nine startup commands in en/pt/es, interactive recovery, literal editor
  source, nested load/waits, plots, timeout/cancellation/reset, backend
  changes, independent Markdown Workers, output presentation and resource
  disposal.
- `npm run test:checks` passed: documentation, catalogue coverage, types, 59
  unit tests, 21 infrastructure tests and 16 legacy Markdown tests.
- Four focused scheduling/resource regressions passed. The two shadow-tree
  disposal tests failed before the resource-lifetime correction and passed
  afterward.
- Formatting and source lint passed. The existing lint configuration ignores
  the targeted test files; their formatting, type checking and execution
  passed.
- `node script/verify-organization-sync.mjs ../mathjslab-github` passed against
  the mirrored source and an isolated clean/copy fixture.

Local evidence is in `registry-*.log` and
`report/registry-package-alignment.json`. This validation targets development
and the reported regression; it is not a rerun of the complete production,
multi-browser and optional HDL release matrix.

Publish the organization correction before the next app update, as planned. For
the current checkout, restart `npm run build:dev` and reload the page to create
a fresh session using the corrected code. Another dependency update is not
needed for this fix. No versions, commits or publications were made here.
