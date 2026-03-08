const embeddingCache = new Map<string, number[]>();

export async function embedChunks(texts: string[]): Promise<number[][]> {
    const uncachedTexts: string[] = [];
    const uncachedIndices: number[] = [];

    for (let i = 0; i < texts.length; i++) {
        if (!embeddingCache.has(texts[i])) {
            uncachedTexts.push(texts[i]);
            uncachedIndices.push(i);
        }
    }

    if (uncachedTexts.length > 0) {
        const response = await fetch(
            "https://router.huggingface.co/hf-inference/models/sentence-transformers/all-MiniLM-L6-v2/pipeline/feature-extraction",
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ inputs: uncachedTexts }),
            }
        );

        const newEmbeddings = await response.json();

        if (!Array.isArray(newEmbeddings)) {
            throw new Error(`HuggingFace error: ${JSON.stringify(newEmbeddings)}`);
        }

        for (let i = 0; i < uncachedTexts.length; i++) {
            embeddingCache.set(uncachedTexts[i], newEmbeddings[i]);
        }
    }

    return texts.map((t) => embeddingCache.get(t)!);
}