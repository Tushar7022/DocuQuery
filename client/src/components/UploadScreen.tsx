import { useRef, useState } from "react";

interface Props {
    onUpload: (file: File) => void;
}

const MAX_SIZE_MB = 25;

const features = [
    { icon: "🔍", label: "Semantic search" },
    { icon: "🤖", label: "AI-powered answers" },
    { icon: "📎", label: "Source citations" },
];

export default function UploadScreen({ onUpload }: Props) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [error, setError] = useState("");
    const [dragging, setDragging] = useState(false);

    function handleFile(file: File) {
        setError("");
        if (file.type !== "application/pdf") {
            setError("Only PDF files are supported.");
            return;
        }
        if (file.size > MAX_SIZE_MB * 1024 * 1024) {
            setError(`File too large. Maximum size is ${MAX_SIZE_MB}MB.`);
            return;
        }
        onUpload(file);
    }

    return (
        <div
            style={{
                minHeight: "100vh",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 48,
                padding: "2rem",
                background: "var(--bg)",
            }}
        >
            {/* Branding */}
            <div style={{ textAlign: "center" }}>
                <h1
                    style={{
                        fontFamily: "'DM Serif Display', serif",
                        fontSize: 84,
                        letterSpacing: "-3px",
                        marginBottom: 16,
                        lineHeight: 1.15,
                        paddingBottom: 4,
                        background: "linear-gradient(135deg, #5B5EF4 0%, #8B5CF6 60%, #C084FC 100%)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        backgroundClip: "text",
                    }}
                >
                    DocuQuery
                </h1>
                <p style={{ color: "var(--muted)", fontSize: 22, lineHeight: 1.6, maxWidth: 520, margin: "0 auto" }}>
                    Ask questions about any PDF. Get cited answers.
                </p>
            </div>

            {/* Upload Card */}
            <div
                style={{
                    width: "100%",
                    maxWidth: 720,
                    background: "var(--surface)",
                    border: "1px solid var(--border)",
                    borderTop: "3px solid var(--accent)",
                    borderRadius: 24,
                    padding: "3.5rem",
                    boxShadow: "0 4px 40px rgba(0,0,0,0.08)",
                    display: "flex",
                    flexDirection: "column",
                    gap: 24,
                }}
            >
                {/* Drop zone */}
                <div
                    onClick={() => inputRef.current?.click()}
                    onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                    onDragLeave={() => setDragging(false)}
                    onDrop={(e) => {
                        e.preventDefault();
                        setDragging(false);
                        const f = e.dataTransfer.files[0];
                        if (f) handleFile(f);
                    }}
                    style={{
                        border: `2px dashed ${dragging ? "var(--accent)" : "var(--border)"}`,
                        borderRadius: 16,
                        padding: "4rem 2rem",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 16,
                        cursor: "pointer",
                        background: dragging ? "#EDEDFF" : "var(--bg)",
                        transition: "all 0.2s ease",
                    }}
                >
                    <div
                        style={{
                            width: 80,
                            height: 80,
                            borderRadius: 18,
                            background: "#5B5EF41A",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 38,
                        }}
                    >
                        📄
                    </div>
                    <div style={{ textAlign: "center" }}>
                        <p style={{ fontWeight: 600, fontSize: 20, color: "var(--text)", marginBottom: 6 }}>
                            Drop your PDF here
                        </p>
                        <p style={{ fontSize: 15, color: "var(--muted)" }}>
                            or{" "}
                            <span style={{ color: "var(--accent)", fontWeight: 500 }}>click to browse</span>
                            {" "}· Max {MAX_SIZE_MB}MB
                        </p>
                    </div>
                </div>

                {/* Error */}
                {error && (
                    <p
                        style={{
                            color: "#c0392b",
                            fontSize: 14,
                            background: "#fdecea",
                            padding: "12px 16px",
                            borderRadius: 10,
                            textAlign: "center",
                        }}
                    >
                        {error}
                    </p>
                )}

                {/* Hidden input */}
                <input
                    ref={inputRef}
                    type="file"
                    accept=".pdf,application/pdf"
                    style={{ display: "none" }}
                    onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) handleFile(f);
                    }}
                />

                {/* Button */}
                <button
                    onClick={() => inputRef.current?.click()}
                    style={{
                        background: "linear-gradient(135deg, #5B5EF4 0%, #8B5CF6 100%)",
                        color: "#fff",
                        border: "none",
                        borderRadius: 12,
                        padding: "18px 0",
                        width: "100%",
                        fontSize: 18,
                        fontWeight: 600,
                        cursor: "pointer",
                        fontFamily: "'DM Sans', sans-serif",
                        letterSpacing: "0.2px",
                        transition: "opacity 0.2s ease",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.88")}
                    onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
                >
                    Choose PDF
                </button>
            </div>

            {/* Feature pills */}
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
                {features.map((f) => (
                    <div
                        key={f.label}
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            background: "var(--surface)",
                            border: "1px solid var(--border)",
                            borderRadius: 999,
                            padding: "8px 18px",
                            fontSize: 15,
                            color: "var(--muted)",
                            boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
                        }}
                    >
                        <span>{f.icon}</span>
                        <span>{f.label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
