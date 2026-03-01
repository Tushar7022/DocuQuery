import { useEffect, useState } from "react";

const steps = [
  "Uploading PDF...",
  "Extracting text...",
  "Generating embeddings...",
];

export default function ProcessingScreen() {
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    if (activeStep === steps.length - 1) return;

    const interval = setInterval(() => {
      setActiveStep((prev) => prev + 1);
    }, 1500);

    return () => clearInterval(interval);
  }, [activeStep]);

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "100vh",
      background: "var(--bg)",
    }}>
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes pulse-ring {
          0% { transform: scale(0.85); opacity: 0.6; }
          50% { transform: scale(1.1); opacity: 0.15; }
          100% { transform: scale(0.85); opacity: 0.6; }
        }
        @keyframes stepIn {
          from { opacity: 0; transform: translateX(-8px); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>

      <div style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderTop: "3px solid var(--accent)",
        borderRadius: 24,
        padding: "5rem 5.5rem",
        maxWidth: 600,
        width: "90%",
        boxShadow: "0 8px 40px rgba(91,94,244,0.10)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 44,
      }}>

        {/* Branding */}
        <span style={{
          fontFamily: "'DM Serif Display', serif",
          fontSize: 36,
          background: "linear-gradient(135deg, #5B5EF4 0%, #8B5CF6 60%, #C084FC 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
        }}>
          DocuQuery
        </span>

        {/* Spinner */}
        <div style={{ position: "relative", width: 110, height: 110, display: "flex", alignItems: "center", justifyContent: "center" }}>
          {/* Pulsing ring */}
          <div style={{
            position: "absolute",
            width: 110,
            height: 110,
            borderRadius: "50%",
            background: "rgba(91,94,244,0.12)",
            animation: "pulse-ring 1.8s ease-in-out infinite",
          }} />
          {/* Spinner ring */}
          <div style={{
            width: 76,
            height: 76,
            borderRadius: "50%",
            border: "4px solid var(--border)",
            borderTop: "4px solid var(--accent)",
            animation: "spin 0.9s linear infinite",
          }} />
        </div>

        {/* Title */}
        <div style={{ textAlign: "center" }}>
          <h2 style={{
            fontFamily: "'DM Serif Display', serif",
            fontSize: 32,
            color: "var(--text)",
            margin: 0,
            marginBottom: 8,
          }}>
            Processing your document
          </h2>
          <p style={{ fontSize: 17, color: "var(--muted)", margin: 0 }}>
            This usually takes a few seconds
          </p>
        </div>

        {/* Steps */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20, width: "100%" }}>
          {steps.map((step, i) => {
            const isDone = i < activeStep;
            const isActive = i === activeStep;

            return (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 18,
                  opacity: i > activeStep ? 0.35 : 1,
                  transition: "opacity 0.4s ease",
                  animation: isActive ? "stepIn 0.3s ease both" : "none",
                  background: isActive ? "#5B5EF408" : "transparent",
                  borderRadius: 12,
                  padding: "14px 18px",
                  border: isActive ? "1px solid #5B5EF420" : "1px solid transparent",
                }}
              >
                {/* Indicator */}
                <div style={{
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  flexShrink: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: isDone
                    ? "linear-gradient(135deg, #5B5EF4, #8B5CF6)"
                    : isActive
                      ? "transparent"
                      : "transparent",
                  border: isActive
                    ? "2px solid var(--accent)"
                    : isDone
                      ? "none"
                      : "2px solid var(--border)",
                  animation: isActive ? "spin 0.9s linear infinite" : "none",
                  transition: "all 0.4s ease",
                  fontSize: 14,
                  color: "#fff",
                }}>
                  {isDone && "✓"}
                </div>

                {/* Label */}
                <span style={{
                  fontSize: 19,
                  color: isActive ? "var(--text)" : isDone ? "var(--muted)" : "var(--muted)",
                  fontWeight: isActive ? 600 : isDone ? 400 : 400,
                  transition: "all 0.3s ease",
                }}>
                  {step}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
