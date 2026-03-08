# DocuQuery

AI-powered document Q&A — upload any PDF and get instant, cited answers.

**[Live Demo](https://docu-query-five.vercel.app)**

![Stack](https://img.shields.io/badge/stack-React%20%7C%20Node.js%20%7C%20Supabase%20%7C%20pgvector-5B5EF4?style=flat-square)
![LLM](https://img.shields.io/badge/LLM-Groq%20llama--3.1--8b-orange?style=flat-square)
![Embeddings](https://img.shields.io/badge/embeddings-HuggingFace%20MiniLM--L6-yellow?style=flat-square)

---

## Overview

DocuQuery is a full-stack RAG (Retrieval-Augmented Generation) system. Upload any PDF — research paper, report, manual — and ask questions about it in plain English. The AI finds the most relevant sections and answers with citations.

---

## How It Works

### 1. Upload & Extract
The PDF is uploaded to Supabase Storage and its text is extracted server-side.

### 2. Chunk & Embed
The text is split into overlapping 500-word chunks to preserve context across boundaries. Each chunk is converted into a 384-dimensional vector using HuggingFace's `sentence-transformers/all-MiniLM-L6-v2` model and stored in Postgres with pgvector.

### 3. Query
When a question is asked, it goes through the same embedding model. pgvector finds the top 5 most semantically similar chunks using cosine similarity.

### 4. Answer
The retrieved chunks are passed as context to Groq's `llama-3.1-8b-instant` LLM, which answers the question and cites the relevant sections as `[1]`, `[2]`, etc.

---

## Architecture

```
Client (React + Vite)
    │
    │  POST /upload (multipart PDF)
    │  POST /query  (question + docId)
    ▼
Server (Node.js + Express + TypeScript)
    │
    ├── PDF text extraction (pdf-parse)
    ├── Text chunking (500 words, 50-word overlap)
    ├── Embedding generation (HuggingFace API)
    │       └── In-memory cache for repeated queries
    └── Vector similarity search (Supabase pgvector RPC)
            │
            └── Groq LLM → cited answer
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, TypeScript, Vite |
| Backend | Node.js, Express 5, TypeScript |
| Database | Supabase (Postgres + pgvector) |
| File Storage | Supabase Storage |
| Embeddings | HuggingFace Inference API (`all-MiniLM-L6-v2`) |
| LLM | Groq API (`llama-3.1-8b-instant`) |
| Deployment | Vercel (frontend) + Render (backend) |

---

## Features

- Drag-and-drop PDF upload (up to 25MB)
- Overlapping chunk strategy so context is never lost at boundaries
- In-memory embedding cache to skip redundant HuggingFace API calls
- Model warm-up on server start to eliminate cold-start latency
- Citation-backed answers with collapsible source viewer
- Multi-message chat UI with typing indicator

---

## Running Locally

### Prerequisites
- Node.js 18+
- Supabase project with pgvector extension enabled
- HuggingFace API key (free tier)
- Groq API key (free tier)

### Setup

Clone the repo, then set up the backend:

```bash
cd server
npm install
# create server/.env with your keys (see Environment Variables below)
npm run dev
```

And the frontend:

```bash
cd client
npm install
npm run dev
```

### Environment Variables

**Backend** (`server/.env`):
```
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_BUCKET=pdfs
HUGGINGFACE_API_KEY=
GROQ_API_KEY=
PORT=8080
```

**Frontend** (`client/.env.local`):
```
VITE_API_URL=http://localhost:8080
```

---

## API Reference

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/upload` | Upload a PDF, triggers full ingestion pipeline |
| `POST` | `/query` | Ask a question against a document |
| `GET` | `/health` | Health check |
