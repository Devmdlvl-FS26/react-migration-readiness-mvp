# Boston Triage CareOps — React 19

A compact, fictional care-operations workspace built with **React 19, TypeScript and Vite**. It is the stabilized React side of a practical Angular vs React comparison: the same operator workflow is implemented with React's component, state and form patterns.

**Scope:** frontend-only demonstration with simulated in-memory data. It is not a deployed healthcare application, a production integration, or a real patient-record system.

## What you can do

- Review a five-case queue with **Open cases**, **High attention** and **Visible after filters** counters.
- Filter by status, high-attention cases and text (organization, case title or owner).
- Select a case to inspect its details, notes and current owner/status.
- Edit **Owner** and **Status** directly within the *Selected care case* panel; optionally add an **Operator note**.
- See form feedback and an activity log when changes are applied.
- Use the in-app **Refresh fake endpoint** action to reload the simulated dataset without losing saved edits in the current page runtime.

### Case Update rules

The controlled form and reducer enforce the same rules:

1. A note is **required when transitioning into `Blocked` from another status** (for example, `New → Blocked`). Whitespace-only notes do not count.
2. If a case is **already `Blocked`**, changing only its owner does **not** require another note.
3. Other status changes, including `Blocked → Done`, do not require a note.
4. A save with no changes produces **“No changes to save.”** and does not record a case update.
5. Successful updates refresh the queue, selected-case details, counters as applicable, notes and activity log.

## In-memory implementation — React 19

**In-memory** describes the data's lifetime, not a shared Angular/React storage mechanism. This version implements it using React state and reducer actions:

1. `getTickets()` in `fakeTicketApi.ts` asynchronously returns a `structuredClone()` of five fixed TypeScript fixtures after a simulated 900 ms delay. It does **not** make an HTTP request.
2. `HelpdeskProvider` owns the shared state with `useReducer(reducer, initialState)` and exposes it through React Context. The reducer's state contains both the current `tickets` array and `caseEdits: Record<number, SavedEdit>` (an ordinary JavaScript object keyed by case ID). `useMemo()` derives filtered cases, selected case, and counters.
3. Saving dispatches `UPDATE_TICKET`. The reducer immutably updates `tickets` and stores the changed status, owner, notes, and update time under `state.caseEdits[ticketId]`.
4. When the in-app **Refresh fake endpoint** button runs `loadTickets()`, it retrieves new copies of the initial fixtures and dispatches `LOAD_SUCCESS`. The reducer merges `state.caseEdits` onto those fresh copies, preserving saved changes during the current page runtime.
5. Reloading the browser mounts a new application and `HelpdeskProvider` with its original `initialState` and an empty `caseEdits` object; the original fixtures return.

**Why this design?** It isolates React's Context/reducer state-management and controlled-form behavior without adding a backend or artificial persistence. The in-memory object preserves *session-local edits across simulated data reloads*; reducer updates drive the interface. This is intentionally **not** persisted storage.

### In-memory data and refresh behavior

1. **Refresh fake endpoint (application button):** Re-reads the simulated fixtures and reapplies saved case edits stored in React reducer state.
2. **Browser reload (F5):** Reinitializes the application and provider state, returning to the initial dataset.
3. **`localStorage` / `sessionStorage`:** Neither is used.
4. **Persistent backend or database:** Neither exists in this demo.

**Important:** The in-app Refresh fake endpoint is not an HTTP endpoint and is not equivalent to refreshing the browser page. These behaviors are deliberate scope decisions.

## React implementation

| Concern | Implementation |
| --- | --- |
| Shared application state | **Context + `useReducer`** in `HelpdeskProvider` |
| Derived UI state | `useMemo()` for filtered cases, selected case and counters |
| Data boundary | Async `getTickets()` returning cloned fixtures after a simulated delay |
| Case editing | **Controlled inputs** and form validation in `CaseUpdate` |
| Component interaction | `useRef` for focusing the search input |
| UI composition | Components with props and `children` / title-slot props |
| Initial load | `useEffect` with cancellation to avoid applying abandoned requests during StrictMode development replay |
| Regression tests | **Vitest + React Testing Library + user-event + jsdom** |

Relevant source files:

- `src/store/HelpdeskContext.tsx` — provider, reducer, selectors and session-only edits.
- `src/services/fakeTicketApi.ts` — five simulated cases.
- `src/components/CaseUpdate.tsx` — editing form and validation.
- `src/components/TicketFilters.tsx` — status/search/high-attention filters.
- `src/components/TicketDetail.tsx` and `SlotCard.tsx` — selected-case UI and composition.

## Run locally

**Prerequisites:** a supported modern Node.js version and npm (Node.js 22 LTS is a practical choice).

From this repository's root folder:

```bash
npm install
npm run dev
```

Open the local URL shown by Vite in the terminal. Run each command in this repository, not in the parent comparison folder.

### Quick manual verification

1. Confirm the initial counters: **4 Open cases**, **3 High attention**, **5 Visible after filters**.
2. Open **Filters**; apply a status filter, search or **High attention only**. Observe the queue and visible counter, then clear filters.
3. Select **#101** (`Blocked`), change **Owner** from Walter to Jose and click **Save changes** without a note. The change should be accepted.
4. Select **#103** (`New`), set **Status** to `Blocked`, leave the note empty and click **Save changes**. Expect a validation error and no saved status change.
5. Add a note for #103, save again and verify its `Blocked` status, appended note and activity-log entry. Then change #103 to `Done` without another note: **Open cases** should become **3**.
6. Click **Refresh fake endpoint** inside the app. Saved edits should remain. **Only afterward**, use **F5** to reload the whole browser page; the initial data should return.

### Automated tests and build

```bash
npm test
npm run build
```

`npm test` runs **Vitest once** (not in watch mode). The React suite contains **10 component/integration-style tests** using real components, Context and reducer, with only the simulated data boundary mocked. The tests cover initial load/counters, filtering, selection, Blocked-note rules, reassignment, closing a case, no-op saves, preserving saved changes after simulated refresh and resetting an unsaved form draft when selecting another case.

**Verified locally on Windows (V5.1, October 2026): 10/10 tests passed and the Vite production build succeeded.** These tests execute against **jsdom**, not a real-browser end-to-end flow; the result is evidence for these scenarios, not exhaustive coverage.

## Comparison and boundaries

The companion **Angular 20** app implements the same workflow using **Signals, `computed()`, a shared service, Reactive Forms and Jasmine/Angular TestBed/Karma**. Its automated suite contains 14 tests. Both apps are intended to be compared by running the same manual scenarios.

The comparison intentionally does **not** implement a persistent API, database, authentication, CI/CD pipeline, SonarQube quality gate, browser E2E suite or coverage reporting. Those would be separate concerns, not requirements for this frontend-focused demonstration.

**Companion repository:** add the new Angular repository URL once published.
