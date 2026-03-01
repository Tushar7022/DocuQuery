const BASE_URL = "http://localhost:8080";

export interface UploadResponse {
    ok: boolean;
    docId: string;
    filename: string;
    chunkCount: number;
    message: string;
}

export interface QueryResponse {
    ok: boolean;
    answer: string;
    sources: {
        chunkIndex: number;
        text: string;
    }[];
}


export async function uploadPdf(file: File): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(`${BASE_URL}/upload`, {
        method: 'POST',
        body: formData,
    });

    if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
    }

    return response.json();


}

export async function sendQuery(
    docId: string,
    question: string
): Promise<QueryResponse> {
    const response = await fetch(`${BASE_URL}/query`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ docId, question }),
    });

    if (!response.ok) {
        throw new Error(`Query failed: ${response.statusText}`);
    }

    return response.json();
}
