import { useState } from "react";
import UploadScreen from "./components/UploadScreen.tsx";
import ProcessingScreen from "./components/ProcessingScreen.tsx";
import ChatScreen from "./components/ChatScreen.tsx";
import { uploadPdf } from "./api.ts";
import "./index.css";

type Stage = "upload" | "processing" | "chat" | "error";

export default function App() {
  const [stage, setStage] = useState<Stage>("upload");
  const [docId, setDocId] = useState("");
  const [filename, setFilename] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleUpload(file: File) {
    setStage("processing");
    try {
      const data = await uploadPdf(file);

      if (data.ok) {
        setDocId(data.docId);
        setFilename(data.filename);
        setStage("chat");
      } else {
        setErrorMsg("Upload failed. Please try again.");
        setStage("error");

      }
    } catch (err) {
      setErrorMsg("Something went wrong. Is the server running?");
      setStage("error");
    }

  }

  function handleReset() {
    setStage("upload");
    setDocId("");
    setFilename("");
    setErrorMsg("");
  }


  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      {stage === "upload" && <UploadScreen onUpload={handleUpload} />}
      {stage === "processing" && <ProcessingScreen />}
      {stage === "chat" && (
        <ChatScreen docId={docId} filename={filename} onReset={handleReset} />
      )}
      {stage === "error" && (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", gap: "1rem" }}>
          <p style={{ color: "red" }}>{errorMsg}</p>
          <button onClick={handleReset}>Try Again</button>
        </div>
      )}
    </div>
  );
}


