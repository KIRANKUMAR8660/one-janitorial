import mongoose from 'mongoose';

const sopDocumentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  category: { type: String, enum: ['Sales', 'HR', 'BCO', 'Client Service', 'General'], default: 'General' },
  filePath: String,
  fileType: String, // PDF, Word, txt
  content: String,  // Raw text content for chunking
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  chunks: [{
    text: String,
    vectorId: String, // Vector DB integration index (Pinecone/ChromaDB)
    chunkIndex: Number
  }]
}, { timestamps: true });

export default mongoose.model('SOPDocument', sopDocumentSchema);
