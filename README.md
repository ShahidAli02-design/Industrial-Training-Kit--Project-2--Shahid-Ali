# 📑 Taxonomy Intelligence & Document Classification Studio

An enterprise-grade document classification, taxonomy optimization, and interactive AI assistant platform powered by **Gemini 3.7 Flash** and **React + TypeScript + Tailwind CSS**.

---

## 🌟 Key Features

### 1. 🤖 Gemini 3.7 Flash Interactive Studio
- **Multimodal AI Assistant**: In-depth document reasoning, code generation, and entity extraction powered by the `@google/genai` SDK.
- **Voice Capabilities**: Real-time microphone speech-to-text input and natural text-to-speech audio playback.
- **Multimodal Attachments**: Upload text snippets, JSON files, or images directly into the chat prompt.
- **Interactive Modes**: Switch between *General Assistant*, *Taxonomy Architect*, *Code & API Pipelines*, and *Document Intelligence & OCR*.
- **Session History & Export**: Manage conversations, filter by keywords, and export transcripts to Markdown or JSON.

### 2. ⚡ Batch & Real-Time Document Classification
- **Automated Routing**: Classify contracts, invoices, tax records, HR forms, and compliance documents into custom taxonomy categories.
- **Confidence Scoring & Risk Assessment**: Real-time confidence ratings, risk scores (1-10), and automated routing for human-in-the-loop review.
- **Structured Entity Extraction**: Extract document titles, statutory codes, dates, amounts, and critical metadata.

### 3. 🎯 Taxonomy Architecture & Schema Builder
- **Custom Categorization**: Define category codes, anchor keywords, minimum confidence thresholds, and color badges.
- **AI Rule Optimizer**: Automatically refine classification boundaries, detect overlapping keywords, and generate disambiguation rules.
- **Synthetic Data Generator**: Generate realistic test documents to stress-test custom taxonomy rules before production deployment.

### 4. 📊 Cluster Visualizer & Active Learning
- **2D Semantic Cluster Map**: Interactive scatter visualizer showing document distribution, clusters, and boundary outliers.
- **Active Learning Queue**: Rapidly review borderline and low-confidence documents with 1-click human corrections.

### 5. 🗄️ Dataset Library & Bulk Operations
- **Bulk Tagging**: Select multiple documents to apply common tags simultaneously or create custom tags.
- **Data Export**: Export classified datasets to formatted CSV or JSON files.
- **Search & Filters**: Multi-criteria filtering by category, status, confidence, or applied tags.

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **Gemini API Key** from [Google AI Studio](https://aistudio.google.com/)

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/taxonomy-document-classifier.git
   cd taxonomy-document-classifier
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env` file in the project root:
   ```env
   GEMINI_API_KEY=your_actual_gemini_api_key_here
   ```

4. **Run the Development Server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🛠️ Build & Deployment

### Production Build
```bash
npm run build
```
This builds the client assets to `dist/` and compiles the standalone backend server into `dist/server.cjs`.

### Start Production Server
```bash
npm start
```

### Static Hosting (GitHub Pages / Vercel / Netlify)
The application includes client-side fallback engines and relative asset paths (`base: './'`), allowing the frontend to run smoothly on static hosts even without an active Node.js server.

---

## 📂 Project Architecture

```
├── server.ts                    # Express backend & Gemini 3.7 Flash API endpoints
├── src/
│   ├── components/
│   │   ├── ActiveLearningView.tsx   # Human-in-the-loop review queue
│   │   ├── ClusterVisualizer.tsx    # 2D semantic embedding scatter map
│   │   ├── DataLibraryView.tsx      # Dataset table with search & bulk tag actions
│   │   ├── DocumentDropzone.tsx     # Drag-and-drop file ingestion interface
│   │   ├── FileInspectorModal.tsx   # Deep inspection of classified documents
│   │   ├── GeminiChatView.tsx       # Advanced interactive multimodal chatbot
│   │   ├── Navbar.tsx               # Main navigation & status bar
│   │   ├── SyntheticDocModal.tsx    # Synthetic benchmark generator
│   │   └── TaxonomyConfigView.tsx   # Schema creator & AI rule optimizer
│   ├── services/
│   │   └── api.ts                   # Client API calls & fallback heuristic engines
│   ├── types.ts                     # TypeScript schemas & interfaces
│   ├── App.tsx                      # Main application orchestrator
│   └── main.tsx                     # React root entry point
├── vite.config.ts               # Vite configuration (with relative base support)
├── package.json                 # Dependencies & scripts
└── README.md                    # Project documentation
```

---

## 📄 License
MIT License. Free for open-source and commercial use.
