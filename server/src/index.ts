import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import uploadRouter from "./routes/upload.routes";
import queryRouter from "./routes/query.routes";
import { embedChunks } from "./service/embeddingService";

dotenv.config();

const app = express()


// to talk with react
app.use(cors())
app.use(express.json())

// check health
app.get("/health", (_req, res) => {
    res.status(200).json({
        ok: true,
        message: "DocuQuery backend running 🚀",
    })
})

// when we hit upload api, pass that to router.ts file
app.use("/upload", uploadRouter);
app.use("/query", queryRouter);

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`✅ Server running at http://localhost:${PORT}`);
    // Warm up HuggingFace model to avoid cold-start delay on first query
    embedChunks(["warmup"]).then(() => {
        console.log("🔥 HuggingFace model warmed up");
    }).catch(() => {
        console.warn("⚠️  HuggingFace warm-up failed (will retry on first request)");
    });
});
