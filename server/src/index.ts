import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import uploadRouter from "./routes/upload.routes";

dotenv.config();

const app = express()

app.use(cors())
app.use(express.json())

app.get("/health", (_req, res) => {
    res.status(200).json({
        ok: true,
        message: "DocuQuery backend running 🚀",
    })
})

app.use("/upload", uploadRouter);

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`✅ Server running at http://localhost:${PORT}`);
});
