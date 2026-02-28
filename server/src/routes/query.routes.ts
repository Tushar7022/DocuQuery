import { Router } from "express";
import { supabase } from "../lib/supabaseClient";
import { embedChunks } from "../service/embeddingService";

const router = Router();

router.post("/", async (req, res) => {
  try {
    const { question, docId } = req.body;

    if (!question || !docId) {
      return res.status(400).json({ ok: false, error: "question and docId are required" });
    }

    // 1. Embed the question
    const [questionEmbedding] = await embedChunks([question]);

    // 2. Find top 5 most similar chunks using pgvector
    const { data: chunks, error: matchErr } = await supabase.rpc("match_chunks", {
      query_embedding: questionEmbedding,
      match_doc_id: docId,
      match_count: 5,
    });

    if (matchErr) {
      return res.status(500).json({ ok: false, error: matchErr.message });
    }

    // 3. Build context from chunks
    const context = chunks.map((c: any, i: number) => `[${i + 1}] ${c.text}`).join("\n\n");

    // 4. Call Groq LLM
    const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: [
          {
            role: "system",
            content:
              "You are a helpful assistant. Answer the user's question using only the provided document context. Cite the relevant section numbers like [1], [2] in your answer.",
          },
          {
            role: "user",
            content: `Context:\n${context}\n\nQuestion: ${question}`,
          },
        ],
      }),
    });

    const groqData = await groqRes.json();

    if (!groqRes.ok) {
      return res.status(500).json({ ok: false, error: `Groq error: ${JSON.stringify(groqData)}` });
    }

    const answer = groqData.choices?.[0]?.message?.content || "No answer generated.";

    // 5. Return answer + source chunks
    return res.status(200).json({
      ok: true,
      answer,
      sources: chunks.map((c: any) => ({
        chunkIndex: c.chunk_index,
        text: c.text,
      })),
    });
  } catch (err: any) {
    return res.status(500).json({ ok: false, error: err?.message || "Query failed" });
  }
});

export default router;
