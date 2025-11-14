import { Router } from "express";
import multer from "multer"; // library to handle file uploads



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

router.post("/", upload.single("file"), (req, res) => {
    if (!req.file) {
        return res.status(400).json({
            ok: false,
            error: "No file uploaded"
        });
    }

    return res.status(200).json({
        ok: true,
        filename: req.file.originalname,
        size: req.file.size,
        message: "PDF received",
    })
});

export default router;

