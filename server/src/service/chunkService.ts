/**
 * Splits large text into smaller overlapping chunks.
 * 
 * Example:
 * chunkSize = 500 words
 * overlap = 50 words
 * 
 * Each chunk becomes:
 * - words[0…499]
 * - words[450…949]
 * - words[900…1399]
 *//**
* Splits large text into smaller overlapping chunks.
* 
* Example:
* chunkSize = 500 words
* overlap = 50 words
* 
* Each chunk becomes:
* - words[0…499]
* - words[450…949]
* - words[900…1399]
*/

export function chunkText(text: string, chunkSize: number = 500, overlap: number = 50): string[] {

    const words = text.split(/\s+/);
    const chunks: string[] = [];

    let start = 0;
    while (start < words.length) {
        const end = start + chunkSize;

        const chunk = words.slice(start, end).join(" ").trim();
        chunks.push(chunk);

        start = end - overlap
    }

    return chunks;

}