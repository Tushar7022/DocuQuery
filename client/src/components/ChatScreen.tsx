import { useState, useRef, useEffect } from "react";
import { sendQuery } from "../api";

interface Props {
    docId: string;
    filename: string;
    onReset: () => void;
}

interface Message {
    role: "user" | "assistant";
    text: string;
    sources?: { chunkIndex: number; text: string }[];
}

export default function ChatScreen({ docId, filename, onReset }: Props) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, loading]);

    async function handleSend() {
        const question = input.trim();
        if (!question || loading) return;

        setInput("");
        setMessages((prev) => [...prev, { role: "user", text: question }]);
        setLoading(true);

        try {
            const data = await sendQuery(docId, question);
            setMessages((prev) => [
                ...prev,
                { role: "assistant", text: data.answer, sources: data.sources },
            ]);
        } catch {
            setMessages((prev) => [
                ...prev,
                { role: "assistant", text: "Something went wrong. Please try again." },
            ]);
        } finally {
            setLoading(false);
        }
    }

    function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    }

    return (
        <div style={{
            display: "flex",
            flexDirection: "column",
            height: "100vh",
            background: "var(--bg)",
        }}>

            {/* Header */}
            <div style={{
                background: "var(--surface)",
                borderBottom: "1px solid var(--border)",
                borderTop: "3px solid var(--accent)",
                padding: "1.25rem 2.5rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                boxShadow: "0 1px 8px rgba(0,0,0,0.04)",
                flexShrink: 0,
            }}>
                <span style={{
                    fontFamily: "'DM Serif Display', serif",
                    fontSize: 26,
                    background: "linear-gradient(135deg, #5B5EF4 0%, #8B5CF6 60%, #C084FC 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                }}>
                    DocuQuery
                </span>

                <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    background: "var(--bg)",
                    border: "1px solid var(--border)",
                    borderRadius: 999,
                    padding: "8px 20px",
                    fontSize: 15,
                    color: "var(--muted)",
                    maxWidth: 400,
                }}>
                    <span>📄</span>
                    <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {filename}
                    </span>
                </div>

                <button
                    onClick={onReset}
                    style={{
                        background: "transparent",
                        border: "1px solid var(--border)",
                        borderRadius: 999,
                        padding: "10px 24px",
                        fontSize: 15,
                        color: "var(--muted)",
                        cursor: "pointer",
                        fontFamily: "'DM Sans', sans-serif",
                        fontWeight: 500,
                        transition: "all 0.2s ease",
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = "var(--accent)";
                        e.currentTarget.style.color = "var(--accent)";
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = "var(--border)";
                        e.currentTarget.style.color = "var(--muted)";
                    }}
                >
                    ← New PDF
                </button>
            </div>

            {/* Messages */}
            <div style={{
                flex: 1,
                overflowY: "auto",
                padding: "2.5rem 3rem",
                display: "flex",
                flexDirection: "column",
                gap: "1.5rem",
                maxWidth: 1000,
                width: "100%",
                margin: "0 auto",
                alignSelf: "center",
                boxSizing: "border-box",
            }} className="messages-scroll">
                <style>{`
                    @keyframes msgIn {
                        from { opacity: 0; transform: translateY(10px); }
                        to { opacity: 1; transform: translateY(0); }
                    }
                    .msg-bubble { animation: msgIn 0.25s ease both; }
                    .messages-scroll::-webkit-scrollbar { width: 5px; }
                    .messages-scroll::-webkit-scrollbar-track { background: transparent; }
                    .messages-scroll::-webkit-scrollbar-thumb { background: #5B5EF440; border-radius: 99px; }
                    .messages-scroll::-webkit-scrollbar-thumb:hover { background: #5B5EF480; }
                    @keyframes typingBounce {
                        0%, 80%, 100% { transform: scale(0.7); opacity: 0.4; }
                        40% { transform: scale(1); opacity: 1; }
                    }
                `}</style>
                {messages.length === 0 && (
                    <div style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        flex: 1,
                        gap: 16,
                        marginTop: "5rem",
                        opacity: 0.55,
                    }}>
                        <div style={{
                            width: 80,
                            height: 80,
                            borderRadius: 20,
                            background: "#5B5EF41A",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 36,
                        }}>
                            💬
                        </div>
                        <div style={{ textAlign: "center" }}>
                            <p style={{ color: "var(--text)", fontSize: 20, fontWeight: 500, marginBottom: 8 }}>
                                Ask anything about your document
                            </p>
                            <p style={{ color: "var(--muted)", fontSize: 16 }}>
                                DocuQuery will find and cite the relevant sections.
                            </p>
                        </div>
                    </div>
                )}

                {messages.map((msg, i) => (
                    <div key={i} className="msg-bubble" style={{
                        alignSelf: msg.role === "user" ? "flex-end" : "flex-start",
                        background: msg.role === "user"
                            ? "linear-gradient(135deg, #5B5EF4 0%, #8B5CF6 100%)"
                            : "var(--surface)",
                        color: msg.role === "user" ? "#fff" : "var(--text)",
                        border: msg.role === "assistant" ? "1px solid var(--border)" : "none",
                        borderLeft: msg.role === "assistant" ? "3px solid var(--accent)" : "none",
                        padding: "1.1rem 1.5rem",
                        borderRadius: msg.role === "user" ? "20px 20px 4px 20px" : "4px 20px 20px 20px",
                        maxWidth: "75%",
                        boxShadow: msg.role === "user"
                            ? "0 2px 16px rgba(91,94,244,0.25)"
                            : "0 2px 12px rgba(0,0,0,0.06)",
                        fontSize: 16,
                        lineHeight: 1.75,
                    }}>
                        <p style={{ margin: 0 }}>{msg.text}</p>

                        {msg.sources && msg.sources.length > 0 && (
                            <details style={{
                                marginTop: "0.75rem",
                                fontSize: "0.8rem",
                                color: msg.role === "user" ? "rgba(255,255,255,0.75)" : "var(--muted)",
                            }}>
                                <summary style={{ cursor: "pointer", fontWeight: 500 }}>View sources</summary>
                                {msg.sources.map((src, j) => (
                                    <p key={j} style={{
                                        marginTop: "0.4rem",
                                        paddingLeft: "0.75rem",
                                        borderLeft: `2px solid ${msg.role === "user" ? "rgba(255,255,255,0.35)" : "var(--border)"}`,
                                    }}>
                                        [{src.chunkIndex}] {src.text.slice(0, 150)}...
                                    </p>
                                ))}
                            </details>
                        )}
                    </div>
                ))}

                {/* Typing indicator */}
                {loading && (
                    <div style={{
                        alignSelf: "flex-start",
                        background: "var(--surface)",
                        border: "1px solid var(--border)",
                        padding: "1rem 1.25rem",
                        borderRadius: "18px 18px 18px 4px",
                        boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
                        display: "flex",
                        gap: 5,
                        alignItems: "center",
                    }}>
                        {[0, 0.2, 0.4].map((delay, i) => (
                            <span key={i} style={{
                                width: 8,
                                height: 8,
                                borderRadius: "50%",
                                background: "var(--accent)",
                                display: "inline-block",
                                animation: `typingBounce 1.2s ease ${delay}s infinite`,
                            }} />
                        ))}
                    </div>
                )}

                <div ref={bottomRef} />
            </div>

            {/* Input bar */}
            <div style={{
                background: "var(--surface)",
                borderTop: "1px solid var(--border)",
                padding: "1.5rem 3rem",
                boxShadow: "0 -1px 8px rgba(0,0,0,0.04)",
                flexShrink: 0,
            }}>
                <div style={{
                    maxWidth: 1000,
                    margin: "0 auto",
                    display: "flex",
                    gap: "0.75rem",
                    alignItems: "center",
                }}>
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Ask a question about your PDF..."
                        disabled={loading}
                        style={{
                            flex: 1,
                            padding: "1.1rem 1.5rem",
                            borderRadius: "14px",
                            border: "1px solid var(--border)",
                            background: "var(--bg)",
                            color: "var(--text)",
                            outline: "none",
                            fontSize: 17,
                            fontFamily: "'DM Sans', sans-serif",
                            transition: "border-color 0.2s ease",
                        }}
                        onFocus={(e) => {
                            e.target.style.borderColor = "var(--accent)";
                            e.target.style.boxShadow = "0 0 0 3px rgba(91,94,244,0.12)";
                        }}
                        onBlur={(e) => {
                            e.target.style.borderColor = "var(--border)";
                            e.target.style.boxShadow = "none";
                        }}
                    />
                    <button
                        onClick={handleSend}
                        disabled={loading}
                        style={{
                            padding: "1.1rem 2rem",
                            borderRadius: "14px",
                            background: loading
                                ? "var(--border)"
                                : "linear-gradient(135deg, #5B5EF4 0%, #8B5CF6 100%)",
                            color: "#fff",
                            border: "none",
                            cursor: loading ? "not-allowed" : "pointer",
                            fontFamily: "'DM Sans', sans-serif",
                            fontWeight: 600,
                            fontSize: 17,
                            transition: "opacity 0.2s ease",
                            whiteSpace: "nowrap",
                        }}
                        onMouseEnter={(e) => { if (!loading) e.currentTarget.style.opacity = "0.88"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
                    >
                        {loading ? "..." : "Send"}
                    </button>
                </div>
            </div>
        </div>
    );
}
