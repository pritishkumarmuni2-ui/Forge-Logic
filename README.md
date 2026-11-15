# ForgeLogic

> A focused code-interview defense platform where candidates write a solution, then explain and defend their technical decisions to an adaptive interviewer.

---

## 🎯 The Problem ForgeLogic Solves

Traditional technical interview preparation platforms focus almost exclusively on getting code to pass unit tests in isolation. However, in real engineering interviews, writing code is only the first step. The decisive phase is the **technical defense**:

- Explaining *why* a particular loop, algorithm, or data structure was selected.
- Tracing iteration mechanics, termination criteria, and pointer states.
- Evaluating algorithmic trade-offs (e.g. `for` vs `while`, $O(n^2)$ vs $O(n)$).
- Reasoning through duplicate inputs and no-solution edge cases.

ForgeLogic is designed as an **adaptive technical interviewer**, not a general explanation chatbot. Rather than solving problems for the candidate, its job is to probe technical choices, evaluate conceptual clarity, and challenge assumptions.

---

## 🧭 The Candidate Interview Flow

```
[ 1. Problem Inspection ]
        │  Candidate views the Two Sum problem statement, examples, and constraints.
        ▼
[ 2. Code Implementation ]
        │  Candidate writes a JavaScript solution in the styled code editor.
        ▼
[ 3. Code Submission ]
        │  Candidate clicks "Submit Code & Start". Static pattern heuristics inspect loop
        │  types and constructs to seed the opening question.
        ▼
[ 4. Technical Defense (Adaptive Interview) ]
        │  • Question 1: Code-grounded question on why a loop was chosen.
        │  • Branching Logic:
        │      - Strong reasoning ──► Advances to deeper mechanics / Big-O.
        │      - Shallow response ──► Prompts for specific boundaries & rationale.
        │      - Misconceptions   ──► Challenges with targeted counter-queries.
        │      - Repeated trouble ──► Provides a focused hint and recovery chance.
        ▼
[ 5. End-of-Session Review ]
        │  Generates a structured assessment of concepts discussed, demonstrated strengths,
        │  areas needing practice, and a concise interviewer evaluation note.
```

---

## ✅ What Genuinely Works in Version 0.1

- **Three-Panel Professional Workspace**: Responsive layout featuring Problem statement, Code Editor with line-number gutters, and Interview Transcript.
- **Curated Problem**: Two Sum (beginner-friendly DSA array problem) with starter code and constraints.
- **Code Language**: JavaScript with standard template and line count tracking.
- **Deterministic Mock Interview Engine**:
  - Code structure inspection (detecting `for`, `while`, nested loops, and hash map patterns).
  - Branching follow-up rules based on transparent answer heuristics.
  - Multi-turn conversation tracking with hint generation after repeated difficulties.
  - Safeguard preventing endless loops on the same question.
- **Structured Session Summary**: End-of-session review tracking questions answered, demonstrated strengths, concepts needing practice, and overall note.
- **Local Persistence (`localStorage`)**: Automatic saving and reloading of in-progress sessions, latest summary, and editor code across browser refreshes.
- **Session Protection**: Modal confirmation prior to discarding an active interview session.
- **Automated Tests**: 11 unit tests powered by Vitest verifying static analysis, classifier categories, branching logic, and summary generation.

---

## ⚠️ Current Limitations (Foundation Prototype)

In accordance with the build principles of this foundation release:

1. **No Real AI / LLM**: The current interviewer is driven by deterministic rule-based heuristics and keyword/pattern categorization. It does not connect to OpenAI, Anthropic, or Gemini APIs.
2. **Transparent Demo Heuristics**: Answer classification uses pattern-matching heuristics (`correct_with_reasoning`, `correct_but_shallow`, `partially_correct`, `incorrect_or_confused`, `alternative_possible`, `unclear`). It does not perform semantic comprehension.
3. **No Arbitrary Code Execution**: Code is not run in a sandbox or executed on a server.
4. **Single Problem & Language**: Only the curated Two Sum problem in JavaScript is currently included.
5. **No Backend or Database**: All state runs locally in the browser with `localStorage` fallback.

---

## 🛠️ Technology Stack

- **Scaffold**: Vite 8 + React 19 + TypeScript
- **Styling**: Modern, responsive plain CSS with a restrained developer dark theme
- **Test Framework**: Vitest
- **Persistence**: Browser `localStorage` abstracted behind a clean service interface
- **Architecture**: Decoupled engine (`src/engine/`) ready to be swapped with a FastAPI backend in future milestones.

---

## 📁 Folder Structure

```
src/
├── app/
│   └── App.tsx                 # Main application shell & tab/layout coordination
├── components/
│   ├── Header.tsx              # Brand header, status indicator & new interview button
│   ├── ProblemPanel.tsx        # Problem statement, examples & constraints
│   ├── CodeEditor.tsx          # Styled editor with line numbers & submission controls
│   ├── InterviewPanel.tsx      # Conversation transcript & auto-scrolling container
│   ├── MessageBubble.tsx       # Distinct interviewer vs candidate message bubbles
│   ├── AnswerComposer.tsx      # Answer input, validation & keyboard shortcuts
│   ├── SessionSummary.tsx      # Comprehensive end-of-session review
│   └── ConfirmationModal.tsx   # Dialog confirming reset of active sessions
├── data/
│   ├── problems.ts             # Two Sum problem definitions and examples
│   └── interviewQuestions.ts   # Scripted question stages, hints & branching prompts
├── engine/
│   ├── answerClassifier.ts     # Transparent pattern & keyword heuristics
│   ├── mockInterviewer.ts      # Top-level interview API (startInterview, submitAnswer, etc.)
│   ├── sessionFlow.ts          # Static code inspection, decision rules & summary builder
│   └── __tests__/
│       └── interviewEngine.test.ts # Vitest automated test suite
├── services/
│   └── sessionStorage.ts       # Resilient localStorage serialization & error handling
├── styles/
│   ├── global.css              # Theme variables, typography & base resets
│   └── interview.css           # 3-panel layout, message bubbles & modal styles
├── types/
│   └── interview.ts            # Core TypeScript interfaces and types
└── main.tsx                    # React application entry point
```

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher recommended, tested on Node v24)
- npm (v9 or higher)

### Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/YOUR-USERNAME/forgelogic.git
cd forgelogic
npm install
```

### Running Locally

Start the local development server:

```bash
npm run dev
```

Open your browser at the URL shown in the terminal (usually `http://localhost:5173`).

### Running Tests

Execute the automated test suite with Vitest:

```bash
npm run test
```

### Production Build

Compile TypeScript and build the optimized production bundle:

```bash
npm run build
```

---

## 🗺️ Future Roadmap

As outlined in the ForgeLogic build guide, upcoming iterations will expand the platform progressively:

1. **Milestone 2**: AST-based code analysis (parsing syntax trees to extract real loop boundaries, variable names, and line references).
2. **Milestone 3**: Backend service (FastAPI backend with typed request/response models and session endpoints).
3. **Milestone 4**: Real AI Interviewer (Connecting an LLM strictly through the backend with structured outputs and system prompt governance).
4. **Milestone 5**: Evidence-based evaluation (Evaluating candidate reasoning against rubric concepts rather than pattern checks).
5. **Milestone 6**: Question bank expansion (Adding arrays, hash maps, sliding window, recursion, and system debugging problems).
