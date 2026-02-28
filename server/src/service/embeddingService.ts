export async function embedChunks(texts: string[]): Promise<number[][]> {
    const response = await fetch(
        "https://router.huggingface.co/hf-inference/models/sentence-transformers/all-MiniLM-L6-v2/pipeline/feature-extraction",
        {
            method: "POST",
            headers: {
                Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ inputs: texts }),
        }
    );

    const embeddings = await response.json();

    if (!Array.isArray(embeddings)) {
        throw new Error(`HuggingFace error: ${JSON.stringify(embeddings)}`);
    }

    return embeddings;
}