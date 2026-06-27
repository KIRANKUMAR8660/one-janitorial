import SOPDocument from '../models/SOPDocument.js';
import logger from '../config/logger.js';

export const chunkAndIndexDocument = async (documentId) => {
  try {
    const doc = await SOPDocument.findById(documentId);
    if (!doc || !doc.content) return;

    logger.info(`RAG indexing started for Document: ${doc.title}`);

    // Standard chunking: split text into 200-character blocks
    const contentText = doc.content;
    const chunkSize = 200;
    const chunks = [];

    for (let i = 0; i < contentText.length; i += chunkSize) {
      const chunkText = contentText.substring(i, i + chunkSize);
      chunks.push({
        text: chunkText,
        chunkIndex: chunks.length,
        vectorId: 'vector-chunk-' + documentId + '-' + chunks.length
      });
    }

    doc.chunks = chunks;
    await doc.save();
    logger.info(`Successfully chunked and index ${chunks.length} nodes for document: ${doc.title}`);
  } catch (error) {
    logger.error(`Failed to chunk and index document: ${error.message}`);
  }
};

export const searchVectorKnowledge = async (query, category) => {
  try {
    logger.info(`Executing vector search for query: "${query}" | Filter Category: ${category || 'None'}`);

    const filter = {};
    if (category) filter.category = category;

    const documents = await SOPDocument.find(filter);
    const results = [];

    // Local TF-IDF style similarity check: simple word-overlap matching
    const queryWords = query.toLowerCase().split(/\s+/).filter(w => w.length > 2);

    for (const doc of documents) {
      for (const chunk of doc.chunks) {
        let score = 0;
        const chunkTextLower = chunk.text.toLowerCase();

        for (const word of queryWords) {
          if (chunkTextLower.includes(word)) {
            score += 1;
          }
        }

        if (score > 0) {
          results.push({
            documentId: doc._id,
            documentTitle: doc.title,
            category: doc.category,
            text: chunk.text,
            score
          });
        }
      }
    }

    // Sort results by score desc
    return results.sort((a, b) => b.score - a.score).slice(0, 5);
  } catch (error) {
    logger.error(`Vector search failed: ${error.message}`);
    return [];
  }
};
