import { Router } from "express";
import multer from "multer"; // library to handle file uploads
import { extractPdfText } from "../service/pdfService";
import { chunkText } from "../service/chunkService";
import { supabase } from "../lib/supabaseClient";
import crypto from "crypto";



const router = Router();


const upload = multer({
  storage: multer.memoryStorage(), //save it in RAM
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type"));
    }

  },
  limits: {
    fileSize: 25 * 1024 * 1024,
  }
});

router.post("/", upload.single("file"), async (req, res) => {
  try {
    console.log("CONTENT-TYPE:", req.headers["content-type"]);
    console.log("FILE RECEIVED?:", !!req.file, req.file?.originalname);
    // 1) Validate input
    if (!req.file) {
      return res.status(400).json({
        ok: false,
        error: "No file uploaded",
      });
    }
    const bucket = process.env.SUPABASE_BUCKET || 'pdfs';
    // 2. Upload to Supabase

    const fileId = crypto.randomUUID();
    const safeName = req.file.originalname.replace(/[^\w.\-]+/g, "_");
    const storagePath = `${fileId}_${safeName}`;

    console.log("STEP A: starting supabase storage upload...");

    const { error: storageErr } = await supabase.storage.from(bucket)
      .upload(storagePath, req.file.buffer, {
        contentType: "application/pdf",
        upsert: false,
      }
      );

    if (storageErr) {
      return res.status(500).json({ ok: false, error: storageErr.message });
    }
    console.log("STEP B: storage upload done, inserting documents row...");

    // 3. Insert into document table
    const { data: docRow, error: docErr } = await supabase
      .from("documents")
      .insert({
        filename: req.file.originalname,
        storage_path: storagePath,
      })
      .select("id")
      .single();

    if (docErr || !docRow?.id) {
      return res.status(500).json({
        ok: false,
        error: docErr?.message || 'Failed to insert document row',
      });
    }

    console.log("STEP C: document row inserted, extracting text...");
    const docId = docRow.id as string;



    //4. Extract text from PDF buffer
    const pdfBuffer = req.file.buffer;
    const text = await extractPdfText(pdfBuffer);

    if (!text) {
      return res.status(422).json({
        ok: false,
        error: "Could not extract text from this PDF (it may be scanned/image-based).",
      });
    }

    // 5. Chunk the text
    const chunks = chunkText(text, 500, 50);


    // 6 Insert chunks (text only for now)
    const chunkRows = chunks.map((chunk, idx) => ({
      doc_id: docId,
      chunk_index: idx,
      text: chunk,
      // embedding: null (we fill in next step)
      // page_num: null (we add later)
    }));

    const { error: chunkErr } = await supabase.from("chunks").insert(chunkRows);

    if (chunkErr) {
      return res.status(500).json({ ok: false, docId, error: chunkErr.message });
    }

    return res.status(200).json({
      ok: true,
      docId,
      filename: req.file.originalname,
      chunkCount: chunks.length,
      message: "Stored PDF in Storage + chunks in Postgres ✅",
    });
  } catch (err: any) {
    return res.status(500).json({
      ok: false,
      error: err?.message || "Upload failed",
    });
  }
});

export default router;