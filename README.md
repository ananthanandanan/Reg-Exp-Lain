# Reg-Exp-Lain

A beautiful, interactive regular expression visualizer built with Next.js and React Flow. Visualize regex patterns as flow diagrams, test strings in real-time, and get contextual explanations for each regex component.

![Dark Mode UI](https://img.shields.io/badge/theme-dark--mode-1e293b?style=flat-square)

## Features

### ✅ Implemented

- **Visual Flow Diagram**: Interactive React Flow visualization showing regex patterns as connected nodes
  - Supports character classes, quantifiers, groups, alternations, and more
  - Dynamic spacing to prevent node overlap
  - Pan, zoom, and minimap navigation
  - Dark theme with Linear.app aesthetic

- **Regex Editor**:
  - Real-time parsing with error handling
  - Syntax validation with inline error messages
  - Debounced input for performance

- **Sandbox Testing** (Phase 3 – Enhanced):
  - Safe/Denied string testing with visual feedback
  - **Match highlighting**: Matches shown via `matchAll()` — green for Safe (expected match), red for Denied (unexpected match)
  - **Match details**: List of each match (index, [start, end), captured groups), styled green/red by context
  - **Paste to Safe / Paste to Denied** from clipboard
  - **Plain-text file upload**: One line = one test entity; batch list with **Safe** and **Denied** buttons per line to send that line into the Safe or Denied test area
  - **Safe** = “this string should match”; **Denied** = “this string should not match”
  - Denied shows “No matches – correctly rejected” (green) when the regex correctly rejects; red highlight and red match details when the regex incorrectly matches a Denied string
  - Green glow for successful Safe matches; red border, red highlight, and red match details when Denied incorrectly matches

- **Step-by-step Debugging** (Phase 4):
  - **Step through match**: Run the regex engine step-by-step on a test string
  - **Prev / Next** controls to move through each step
  - **String position highlight**: Current character position shown in the test string
  - **Flow diagram sync**: The active regex node is highlighted in the visualizer at each step
  - Works with character classes, quantifiers, alternation, and backtracking (e.g. email-style patterns)

- **Contextual Explanations**:
  - Click any node in the flow diagram to see detailed explanations
  - Slide-out panel with human-readable descriptions
  - AST node type information

- **Dark Mode UI**:
  - Tokyo Night inspired color palette
  - Thin borders and subtle rounded corners
  - Professional, modern aesthetic

### 🚧 Future Enhancements

- Cross-highlighting between editor and visualizer nodes
- Multiple regex engine support (Python, PHP)
- Export/sharing functionality
- Monaco Editor integration for advanced syntax highlighting

## Getting Started

### Prerequisites

- Node.js 18+
- npm, yarn, pnpm, or bun

### Installation

```bash
git clone <repository-url>
cd regexplain

npm install

npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
npm run build
npm start
```

## Usage

1. **Enter a Regex Pattern**: Type your regex pattern in the top-left editor pane
   - Example: `^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$`

2. **View the Flow Diagram**: The right panel automatically visualizes your regex as a flow diagram
   - Nodes represent different regex components (character classes, quantifiers, groups, etc.)
   - Edges show the flow of matching

3. **Get Explanations**: Click on any node in the flow diagram to see a detailed explanation
   - The explanation panel slides in from the right
   - Shows what that regex component does in plain English

4. **Test Strings**: Use the sandbox pane (bottom-left) to test strings
   - **Safe**: Enter strings that _should_ match your regex (e.g. valid emails)
   - **Denied**: Enter strings that _should not_ match (e.g. invalid inputs)
   - Green = correct (Safe matched, or Denied correctly rejected); red = wrong (Denied matched when it shouldn’t)
   - Use **Paste to Safe/Denied** or **Upload .txt** (one line per entity) for batch testing — see below.

   **Batch testing (upload + Safe/Denied)**  
   Upload a plain-text file where each line is one test case. The batch list shows a tick (✓) or circle (○) for whether that line currently matches the regex. Use the **Safe** and **Denied** buttons to send a line into the Safe or Denied test area:
   - Click **Safe** on a line you expect to match → it becomes the current Safe string; you see green highlight and “Matches” when the regex behaves correctly.
   - Click **Denied** on a line you expect to be rejected → it becomes the current Denied string; you see “No matches – correctly rejected” when correct, or red highlight and match details when the regex wrongly matches.
   - Use this to quickly try many test cases from your list: pick one line as Safe and one as Denied, check the result, then try another line. Refine your regex until Safe cases stay green and Denied cases are never red.

   _Example:_ You’re building an email regex. You upload a file with `hello@test.com`, `not-an-email`, `user.name@domain.org`, `invalid@`, and `contact@company.co`. You click **Safe** on `hello@test.com` → green “Matches”. You click **Denied** on `not-an-email` → “Correctly rejected”. You click **Safe** on `user.name@domain.org` → if your regex doesn’t allow dots in the local part, you see red “No match”; you then adjust the regex and test again until Safe cases are green and Denied cases are correctly rejected (no red).

5. **Step-through Debug** (when a Safe string matches): Click **Step through match**
   - Use **Prev** / **Next** to move through the match step-by-step
   - The flow diagram highlights the current regex node; the string shows the current position

## Architecture

The application follows a unidirectional data flow:

```
User Input → regjsparser → AST → Transformer → React Flow Nodes/Edges → Renderer
```

### Key Components

- **`lib/parser/regexParser.ts`**: Wraps regjsparser to parse regex strings into AST
- **`lib/transformer/astToFlow.ts`**: Converts AST to React Flow nodes and edges with dynamic layout
- **`lib/transformer/astToExplanation.ts`**: Converts AST nodes to human-readable explanations
- **`lib/store/useRegexStore.ts`**: Zustand store for application state (including debug state)
- **`lib/debug/regexDebugTracer.ts`**: Step-by-step tracer (backtracking match with step recording)
- **`components/VisualizerCanvas.tsx`**: React Flow canvas with custom nodes; syncs highlight in debug mode
- **`components/ExplanationPanel.tsx`**: Contextual explanation slide-out panel
- **`components/SandboxPane.tsx`**: String testing, match highlight, match details, paste/upload, step-through debug

## Tech Stack

- **Framework**: [Next.js](https://nextjs.org) 16
- **UI Library**: React 19
- **Visualization**: [React Flow](https://reactflow.dev) (@xyflow/react)
- **Regex Parsing**: [regjsparser](https://github.com/jviereck/regjsparser)
- **State Management**: [Zustand](https://zustand-demo.pmnd.rs)
- **Styling**: [Tailwind CSS](https://tailwindcss.com) 4
- **Language**: TypeScript

## Project Structure

```
regexplain/
├── app/
│   ├── page.tsx              # Main layout with split pane
│   ├── layout.tsx            # Root layout
│   └── globals.css            # Global styles
├── components/
│   ├── EditorPane.tsx         # Regex input editor
│   ├── SandboxPane.tsx        # String testing pane
│   ├── VisualizerCanvas.tsx   # React Flow canvas
│   ├── ExplanationPanel.tsx   # Explanation slide-out panel
│   └── nodes/                 # Custom React Flow node components
│       ├── StartNode.tsx
│       ├── MatchNode.tsx
│       ├── LoopNode.tsx
│       ├── GroupNode.tsx
│       ├── AlternationNode.tsx
│       └── EndNode.tsx
├── lib/
│   ├── parser/
│   │   ├── regexParser.ts     # Regex parser wrapper
│   │   └── astTypes.ts        # TypeScript types
│   ├── transformer/
│   │   ├── astToFlow.ts       # AST to React Flow transformer
│   │   └── astToExplanation.ts # AST to explanation transformer
│   ├── debug/
│   │   └── regexDebugTracer.ts # Step-by-step match tracer (backtracking)
│   └── store/
│       └── useRegexStore.ts   # Zustand store
└── README.md
```

## Development

### Code Style

- TypeScript for type safety
- ESLint for code quality
- Prettier for formatting
- Husky + lint-staged for pre-commit checks
- Tailwind CSS for styling
- Functional components with hooks

### Code Quality Commands

```bash
# Lint entire project
npm run lint

# Format entire project
npm run format

# Check formatting without writing
npm run format:check

# Run staged-file tasks manually
npm run lint-staged
```

### Git Hooks (Husky)

- `prepare` script installs Husky hooks after `npm install`
- Pre-commit hook runs `npm run lint-staged`
- Current `lint-staged` config:
  - `*.{js,jsx,ts,tsx,mjs,cjs}` -> `eslint --fix`
  - `*.{json,md,css,scss,yml,yaml}` -> `prettier --write`

### Key Design Decisions

- **Dynamic Node Spacing**: Calculates spacing based on label width to prevent overlap
- **AST Node Storage**: Stores AST nodes directly on flow nodes for efficient explanation lookup
- **Debounced Parsing**: Prevents excessive re-parsing on every keystroke
- **Dark Mode First**: Designed with dark theme as default

## Acknowledgments

- Built with [React Flow](https://reactflow.dev) for visualization
- Uses [regjsparser](https://github.com/jviereck/regjsparser) for regex parsing
- Inspired by tools like [regex101](https://regex101.com) and [regexr](https://regexr.com)
