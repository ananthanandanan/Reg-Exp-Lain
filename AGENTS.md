# AGENTS.md

Guidance for coding agents working in `regexplain`.

## Project Snapshot

- Framework: Next.js 16 (App Router) + React 19 + TypeScript (strict mode).
- Visualization: `@xyflow/react` (React Flow).
- Parsing: `regjsparser`.
- State: Zustand store in `lib/store/useRegexStore.ts`.
- Styling: Tailwind CSS v4 + `app/globals.css`.
- Package manager: npm (lockfile is `package-lock.json`).

## Source Of Truth For Rules

- Cursor rules directory `.cursor/rules/`: not present in this repo.
- `.cursorrules`: not present in this repo.
- Copilot instructions `.github/copilot-instructions.md`: not present in this repo.
- Therefore, this file + existing repo conventions are the operative agent rules.

## Install And Run

- Install dependencies: `npm install`
- Start dev server: `npm run dev`
- Build for production: `npm run build`
- Start production server: `npm run start`

## Lint / Format / Quality Commands

- Lint full repo: `npm run lint`
- Lint a single file: `npm run lint -- app/page.tsx`
- Lint and auto-fix staged-style files: `npm run lint-staged`
- Format entire repo: `npm run format`
- Check formatting only: `npm run format:check`
- Format one file: `npx prettier --write components/SandboxPane.tsx`
- Check one file formatting: `npx prettier --check components/SandboxPane.tsx`
- Type-check project (no emit): `npx tsc --noEmit`

## Tests (Current State + Single-Test Guidance)

- There is currently no configured test runner in `package.json`.
- There are no `test`/`spec` files or `__tests__` directories at this time.
- There is no `npm test` script.
- Single-test command is currently not applicable.
- For now, validation is lint + type-check + manual behavior checks in the app.
- If you add a test framework, add scripts for both full suite and single-test runs.

## Pre-Commit Automation

- Husky is enabled via `prepare` script (`npm run prepare` runs on install).
- Pre-commit hook (`.husky/pre-commit`) runs: `npm run lint-staged`.
- `lint-staged` rules from `package.json`:
- `*.{js,jsx,ts,tsx,mjs,cjs}` -> `eslint --fix`
- `*.{json,md,css,scss,yml,yaml}` -> `prettier --write`
- Expect staged files to be auto-modified; re-stage after hook fixes.

## Architecture Map

- `app/page.tsx`: main split layout and pane composition.
- `components/EditorPane.tsx`: regex input + parse error display.
- `components/SandboxPane.tsx`: safe/denied testing + debug controls.
- `components/VisualizerCanvas.tsx`: React Flow graph rendering + selection sync.
- `components/ExplanationPanel.tsx`: contextual explanation side panel.
- `lib/parser/regexParser.ts`: parser wrapper around `regjsparser`.
- `lib/transformer/astToFlow.ts`: AST -> React Flow nodes/edges.
- `lib/transformer/astToExplanation.ts`: AST -> explanation text.
- `lib/debug/regexDebugTracer.ts`: step-through debug trace builder.
- `lib/store/useRegexStore.ts`: app state/actions (single source of truth).

## Code Style (Observed Conventions)

## Language and TypeScript

- Use TypeScript for all app logic and components.
- Keep `strict`-mode compatibility (see `tsconfig.json`).
- Prefer explicit interfaces/types for non-trivial data shapes.
- Use `type` imports where appropriate (`import type { X } from "..."`).
- Avoid `any`; use unions, generics, and narrowing instead.
- Handle nullable values explicitly (`| null`) for UI state.

## Imports and Module Boundaries

- Use alias imports for app-local modules: `@/...`.
- Use relative imports mainly inside `lib/*` internal folders.
- Keep imports grouped logically: external packages, then internal modules.
- Prefer one concern per module and keep transformer/parser responsibilities separate.

## React and Component Patterns

- Use function components and hooks (no class components).
- Mark client components with `"use client"` when required.
- Keep derived values memoized when they are recomputed often (`useMemo`).
- Use `useCallback` for event handlers passed into heavy child trees.
- Keep presentational subcomponents small and local if not reused elsewhere.
- Prefer controlled inputs for editor/sandbox text areas.

## Zustand Store Patterns

- Keep shared cross-pane state in `useRegexStore`.
- Expose actions as store methods with clear names (`setX`, `startDebug`, etc.).
- Return structured results for operations (`{ matches, error, ... }`).
- Keep parsing/matching side effects predictable and centralized.

## Naming Conventions

- Components: PascalCase (`VisualizerCanvas`, `ExplanationPanel`).
- Functions/variables: camelCase (`parseRegex`, `debugNextStep`).
- Interfaces/types: PascalCase (`MatchAllResult`, `FlowNode`).
- Constants: UPPER_SNAKE_CASE for fixed config values.
- Booleans: `is/has/can` prefixes when meaningful (`isOpen`, `matches`).

## Formatting Conventions

- Follow Prettier defaults as executed by repo scripts.
- Use semicolons and double quotes consistently.
- Prefer trailing commas where formatter inserts them.
- Keep JSX class lists readable; use template strings for conditional classes.
- Keep line length practical; rely on formatter for wrapping.

## Error Handling

- Prefer non-throwing UI flows: catch errors and return user-displayable messages.
- In `catch`, narrow unknown errors with `error instanceof Error`.
- Provide safe fallback messages (`"Invalid regex pattern"`, etc.).
- Fail gracefully in UI (show state text, do not crash render tree).

## Regex Domain Conventions

- Normalize user regex input before parsing/matching (trim, slash handling).
- Keep parser features explicit in one place (`parseRegex`).
- Keep AST-to-flow transformation deterministic and side-effect-light.
- Use stable node/edge id construction to avoid React Flow mismatch.

## CSS / Styling

- Tailwind utility classes are primary styling mechanism.
- Global theme tokens and shared overrides live in `app/globals.css`.
- Maintain current dark, slate-based visual language unless asked otherwise.
- Preserve existing React Flow visual overrides when changing canvas behavior.

## Agent Workflow Expectations

- Before finalizing, run: `npm run lint` and `npx tsc --noEmit`.
- If formatting changed, run `npm run format` (or file-scoped Prettier).
- For behavior changes, run the app with `npm run dev` and manually verify:
- regex parse errors render correctly.
- flow nodes/edges update after regex input.
- safe/denied match behavior and debug stepping still work.
- explanation panel opens/closes and displays AST-derived text.

## Change Scope and Safety

- Make minimal, focused edits that fit existing architecture.
- Avoid introducing new dependencies unless clearly necessary.
- Do not refactor unrelated files in the same change.
- Update docs/scripts if you add test infrastructure.
- If test tooling is added, also document single-test command in this file.
