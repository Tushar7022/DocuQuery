# DocuQuery
AI-powered document Q&amp;A system built with React, Node.js, and pgvector.

DocuQuery - AI-Powered Document Q&A
What it does:
Upload PDF → Ask questions in plain English → Get accurate answers with citations
User Experience:
1. User uploads research paper/manual/report (PDF)
2. System processes it in background (10-30 sec)
3. User asks: "What were the main findings?"
4. AI responds with answer + shows which page/section it came from
5. User can ask follow-ups, system remembers context
Technical Flow:
Step 1: Upload & Extract
User uploads PDF via React UI
Backend receives file, extracts text with pdf-parse
Stores PDF in Supabase Storage
Step 2: Chunk & Embed
Split text into ~500 word chunks (overlap for context)
Each chunk → embedding API → 768-dim vector
Store chunks + vectors in Postgres with pgvector
Step 3: Query
User asks question
Question → embedding API → vector
pgvector finds top 3-5 most similar chunks (cosine similarity)
Send question + relevant chunks to LLM
Step 4: Answer
LLM reads chunks, answers question
Returns answer + chunk IDs as citations
Frontend shows answer with "Page X" references
Tech Stack:
Frontend (React):
File upload with drag-drop
Chat interface (messages list)
Loading states during processing
Citation display
Backend (Node.js + Express):
/upload - receives PDF, triggers processing
/query - takes question, returns answer
PDF text extraction
Embedding generation
Vector similarity search
Database (Supabase Postgres + pgvector):
sql
documents (id, filename, upload_date)
chunks (id, doc_id, text, embedding, page_num)
APIs:
HuggingFace Inference API (embeddings) - FREE
Groq API (LLM answers) - FREE
Key Features:
Smart chunking - Overlapping chunks so context isn't lost
Citation system - Every answer shows source pages
Multi-turn chat - Ask follow-ups
Processing status - Shows "Processing..." while embedding
What Makes It Interview-Ready:
Node.js showcase:
Async file handling
Database operations (SQL + vector queries)
REST API design
External API integration
Error handling
React showcase:
File upload component
Real-time chat UI
State management (uploaded docs, chat history)
Loading/error states
Responsive design
System Design talking points:
"Why 500 word chunks?" (balance context vs. precision)
"How do you handle large PDFs?" (streaming, pagination)
"How do you scale?" (caching embeddings, connection pooling)
"What if vector search returns wrong chunks?" (re-ranking, score thresholds)
Build Complexity:
Not too easy: Real data pipeline, vector search, multi-API
Not too hard: No model training, well-documented libraries
Just right: 10 days with guidance

