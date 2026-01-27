# Regexplain

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

- **Sandbox Testing**:
  - Safe/Denied string testing with visual feedback
  - Real-time match validation
  - Group capture display
  - Green glow for successful matches, red indicators for errors

- **Contextual Explanations**:
  - Click any node in the flow diagram to see detailed explanations
  - Slide-out panel with human-readable descriptions
  - AST node type information

- **Dark Mode UI**:
  - Tokyo Night inspired color palette
  - Thin borders and subtle rounded corners
  - Professional, modern aesthetic

### 🚧 Future Enhancements

- **Phase 3 - Match Highlighting**: Use `String.prototype.matchAll()` to find all matches and highlight them visually in the test strings
- **Phase 4 - Step-by-step Debugging**: Interactive debugging where users can click through the string to see which part of the regex matches at each position
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
# Clone the repository
git clone <repository-url>
cd regexplain

# Install dependencies
npm install

# Run the development server
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
   - **Safe**: Enter strings that should match your regex
   - **Denied**: Enter strings that should NOT match
   - Visual feedback shows match status in real-time

## Architecture

The application follows a unidirectional data flow:

```
User Input → regjsparser → AST → Transformer → React Flow Nodes/Edges → Renderer
```

### Key Components

- **`lib/parser/regexParser.ts`**: Wraps regjsparser to parse regex strings into AST
- **`lib/transformer/astToFlow.ts`**: Converts AST to React Flow nodes and edges with dynamic layout
- **`lib/transformer/astToExplanation.ts`**: Converts AST nodes to human-readable explanations
- **`lib/store/useRegexStore.ts`**: Zustand store for managing application state
- **`components/VisualizerCanvas.tsx`**: Main React Flow canvas with custom nodes
- **`components/ExplanationPanel.tsx`**: Contextual explanation slide-out panel
- **`components/SandboxPane.tsx`**: String testing interface

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
│   └── store/
│       └── useRegexStore.ts   # Zustand store
└── README.md
```

## Development

### Code Style

- TypeScript for type safety
- ESLint for code quality
- Tailwind CSS for styling
- Functional components with hooks

### Key Design Decisions

- **Dynamic Node Spacing**: Calculates spacing based on label width to prevent overlap
- **AST Node Storage**: Stores AST nodes directly on flow nodes for efficient explanation lookup
- **Debounced Parsing**: Prevents excessive re-parsing on every keystroke
- **Dark Mode First**: Designed with dark theme as default

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT

## Acknowledgments

- Built with [React Flow](https://reactflow.dev) for visualization
- Uses [regjsparser](https://github.com/jviereck/regjsparser) for regex parsing
- Inspired by tools like [regex101](https://regex101.com) and [regexr](https://regexr.com)
