# DocuQuery

AI-powered document Q&A — upload any PDF and get instant, cited answers.

**[Live Demo](https://docu-query-five.vercel.app)** · [Backend API](https://docuquery-backend-uc49.onrender.com/health)

![Stack](https://img.shields.io/badge/stack-React%20%7C%20Node.js%20%7C%20Supabase%20%7C%20pgvector-5B5EF4?style=flat-square)
![LLM](https://img.shields.io/badge/LLM-Groq%20llama--3.1--8b-orange?style=flat-square)
![Embeddings](https://img.shields.io/badge/embeddings-HuggingFace%20MiniLM--L6-yellow?style=flat-square)

---

## What it does

1. **Upload** a PDF (research paper, manual, report)
2. **DocuQuery processes it** — extracts text, chunks it, generates vector embeddings
3. **Ask questions** in plain English
4. **Get answers** grounded in the document, with source citations

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, TypeScript, Vite |
| Backend | Node.js, Express 5, TypeScript |
| Database | Supabase (Postgres + pgvector) |
| Embeddings | HuggingFace `sentence-transformers/all-MiniLM-L6-v2` |
| LLM | Groq API (`llama-3.1-8b-instant`) |
| Storage | Supabase Storage |

---

## Architecture

```
PDF Upload
    │
    ▼
Extract text (pdf-parse)
    │
    ▼
Chunk into 500-word overlapping windows
    │
    ▼
Embed chunks (HuggingFace) → store in pgvector
    │
    ▼
User asks question
    │
    ▼
Embed question → cosine similarity search (top 5 chunks)
    │
    ▼
Groq LLM answers using retrieved context → cited response
```

---

## Features

- Drag-and-drop PDF upload (max 25MB)
- Overlapping chunk strategy to preserve context across boundaries
- In-memory embedding cache — repeated queries skip the HuggingFace API call
- HuggingFace model warm-up on server start to eliminate cold-start latency
- Citation-backed answers — LLM cites `[1]`, `[2]` mapped to source chunks
- Multi-message chat UI with typing indicator and collapsible sources

---

## Running Locally

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project with pgvector enabled
- [HuggingFace](https://huggingface.co) API key (free)
- [Groq](https://console.groq.com) API key (free)

### Supabase Setup

Run this SQL in your Supabase SQL editor:

```sql
create extension if not exists vector;

create table documents (
  id uuid primary key default gen_random_uuid(),
  filename text not null,
  storage_path text not null,
  created_at timestamptz default now()
);

create table chunks (
  id uuid primary key default gen_random_uuid(),
  doc_id uuid references documents(id) on delete cascade,
  chunk_index integer not null,
  text text not null,
  embedding vector(384)
);

create or replace function match_chunks(
  query_embedding vector(384),
  match_doc_id uuid,
  match_count int
)
returns table (id uuid, chunk_index integer, text text, similarity float)
language sql stable
as $$
  select id, chunk_index, text,
    1 - (embedding <=> query_embedding) as similarity
  from chunks
  where doc_id = match_doc_id
  order by embedding <=> query_embedding
  limit match_count;
$$;
```

Create a storage bucket named `pdfs`.

### Backend

```bash
cd server
npm install
```

Create `server/.env`:

```
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SUPABASE_BUCKET=pdfs
HUGGINGFACE_API_KEY=your_hf_key
GROQ_API_KEY=your_groq_key
PORT=8080
```

```bash
npm run dev
```

### Frontend

```bash
cd client
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

---

## API

### `POST /upload`

Accepts `multipart/form-data` with a `file` field (PDF).

```json
{
  "ok": true,
  "docId": "uuid",
  "filename": "paper.pdf",
  "chunkCount": 42,
  "message": "Stored PDF + chunks + embeddings ✅"
}
```

### `POST /query`

```json
// Request
{ "docId": "uuid", "question": "What are the main findings?" }

// Response
{
  "ok": true,
  "answer": "The main findings are... [1][2]",
  "sources": [
    { "chunkIndex": 3, "text": "..." },
    { "chunkIndex": 7, "text": "..." }
  ]
}
```

### `GET /health`

```json
{ "ok": true, "message": "DocuQuery backend running 🚀" }
```
