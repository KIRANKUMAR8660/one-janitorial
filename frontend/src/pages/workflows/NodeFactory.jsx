import React from 'react';
import { Handle, Position } from 'reactflow';
import { Box, Typography } from '@mui/material';

// Icon Imports
import HubIcon from '@mui/icons-material/Hub';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import PhoneInTalkIcon from '@mui/icons-material/PhoneInTalk';
import LayersIcon from '@mui/icons-material/Layers';
import TimerIcon from '@mui/icons-material/Timer';
import PlaylistAddCheckIcon from '@mui/icons-material/PlaylistAddCheck';
import StorageIcon from '@mui/icons-material/Storage';
import HttpIcon from '@mui/icons-material/Http';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import GridOnIcon from '@mui/icons-material/GridOn';
import DescriptionIcon from '@mui/icons-material/Description';
import ImageIcon from '@mui/icons-material/Image';
import AudiotrackIcon from '@mui/icons-material/Audiotrack';
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary';
import PsychologyIcon from '@mui/icons-material/Psychology';
import SettingsSuggestIcon from '@mui/icons-material/SettingsSuggest';
import FactCheckIcon from '@mui/icons-material/FactCheck';

// Node registry configuration mapping
export const nodeRegistry = {};

// Helper to register node types
export const registerNode = (config) => {
  nodeRegistry[config.type] = {
    name: config.name,
    description: config.description,
    icon: config.icon || HubIcon,
    inputs: config.inputs || ['input'],
    outputs: config.outputs || ['output'],
    headerClass: config.headerClass || 'utility',
    configFields: config.configFields || []
  };
};

/* =========================================================
   1. TRIGGERS CATEGORY
   ========================================================= */
registerNode({
  type: 'HubSpotTrigger',
  name: 'HubSpot Trigger',
  description: 'Triggers when a HubSpot Deal or Lead is updated.',
  icon: CompareArrowsIcon,
  inputs: [],
  outputs: ['output'],
  headerClass: 'trigger',
  configFields: [
    { name: 'triggerType', type: 'select', label: 'Trigger Event', options: ['Deal Closed Won', 'Lead Created', 'Ticket Created'] }
  ]
});

registerNode({
  type: 'SchedulerNode',
  name: 'Cron Scheduler',
  description: 'Triggers workflow execution at scheduled intervals.',
  icon: TimerIcon,
  inputs: [],
  outputs: ['output'],
  headerClass: 'trigger',
  configFields: [
    { name: 'cron', type: 'text', label: 'Cron Expression (e.g. 0 9 * * *)' }
  ]
});

registerNode({
  type: 'WebhookNode',
  name: 'Webhook Trigger',
  description: 'Exposes an HTTP Webhook endpoint to trigger the workflow.',
  icon: HttpIcon,
  inputs: [],
  outputs: ['output'],
  headerClass: 'trigger',
  configFields: [
    { name: 'method', type: 'select', label: 'HTTP Method', options: ['POST', 'GET'] }
  ]
});


/* =========================================================
   2. CRM CATEGORY
   ========================================================= */
registerNode({
  type: 'CRMNode',
  name: 'HubSpot CRM Action',
  description: 'Creates or updates details inside the HubSpot CRM.',
  icon: CompareArrowsIcon,
  inputs: ['input'],
  outputs: ['success', 'error'],
  headerClass: 'crm',
  configFields: [
    { name: 'actionType', type: 'select', label: 'Action Type', options: ['create_lead', 'update_deal'] },
    { name: 'firstName', type: 'text', label: 'First Name' },
    { name: 'lastName', type: 'text', label: 'Last Name' },
    { name: 'email', type: 'text', label: 'Lead Email' },
    { name: 'phone', type: 'text', label: 'Phone' },
    { name: 'clientEmail', type: 'text', label: 'Deal Client Email' },
    { name: 'stage', type: 'text', label: 'Deal Stage (e.g. Closed Won)' }
  ]
});

registerNode({
  type: 'TicketNode',
  name: 'Support Ticketing',
  description: 'Creates or modifies client service support tickets.',
  icon: PlaylistAddCheckIcon,
  inputs: ['input'],
  outputs: ['output'],
  headerClass: 'crm',
  configFields: [
    { name: 'action', type: 'select', label: 'Action Type', options: ['create', 'update'] },
    { name: 'title', type: 'text', label: 'Ticket Title' },
    { name: 'description', type: 'textarea', label: 'Problem Details' },
    { name: 'clientEmail', type: 'text', label: 'Client Email' },
    { name: 'priority', type: 'select', label: 'Priority', options: ['Low', 'Medium', 'High', 'Urgent'] }
  ]
});


/* =========================================================
   3. AI AGENTS CATEGORY
   ========================================================= */
registerNode({
  type: 'OpenAINode',
  name: 'OpenAI Prompt',
  description: 'Dispatches custom structured prompt queries to GPT-4o.',
  icon: AutoAwesomeIcon,
  inputs: ['input'],
  outputs: ['output'],
  headerClass: 'ai',
  configFields: [
    { name: 'systemPrompt', type: 'textarea', label: 'System Instructions' },
    { name: 'prompt', type: 'textarea', label: 'User Prompt' }
  ]
});

registerNode({
  type: 'ClaudeNode',
  name: 'Claude 3.5 Sonnet',
  description: 'Leverages Anthropic Claude for text extraction and summaries.',
  icon: AutoAwesomeIcon,
  inputs: ['input'],
  outputs: ['output'],
  headerClass: 'ai',
  configFields: [
    { name: 'systemPrompt', type: 'textarea', label: 'System Instructions' },
    { name: 'prompt', type: 'textarea', label: 'User Prompt' }
  ]
});

registerNode({
  type: 'AIAgentNode',
  name: 'AI Agent builder',
  description: 'Triggers an autonomous agent reasoning loop.',
  icon: AutoAwesomeIcon,
  inputs: ['input'],
  outputs: ['output'],
  headerClass: 'ai',
  configFields: [
    { name: 'agentId', type: 'agent_select', label: 'Select Target Agent' },
    { name: 'task', type: 'textarea', label: 'Assigned Objective' }
  ]
});


/* =========================================================
   4. HR CATEGORY
   ========================================================= */
registerNode({
  type: 'EmployeeNode',
  name: 'Employee Action',
  description: 'Performs directory checks on operational employees.',
  icon: PlaylistAddCheckIcon,
  inputs: ['input'],
  outputs: ['found', 'not_found'],
  headerClass: 'hr',
  configFields: [
    { name: 'email', type: 'text', label: 'Target Email Address' }
  ]
});


/* =========================================================
   5. REPORTING CATEGORY
   ========================================================= */
registerNode({
  type: 'ExcelReportGeneratorNode',
  name: 'Excel Report Gen',
  description: 'Generates periodic status reports into Excel formats.',
  icon: GridOnIcon,
  inputs: ['input'],
  outputs: ['output'],
  headerClass: 'reporting',
  configFields: [
    { name: 'reportTitle', type: 'text', label: 'Report Name' },
    { name: 'reportCategory', type: 'text', label: 'Category Group' }
  ]
});


/* =========================================================
   6. INTEGRATIONS CATEGORY
   ========================================================= */
registerNode({
  type: 'GmailNode',
  name: 'Gmail Send',
  description: 'Sends email messages through a corporate Google account.',
  icon: MailOutlineIcon,
  inputs: ['input'],
  outputs: ['output'],
  headerClass: 'integration',
  configFields: [
    { name: 'to', type: 'text', label: 'Recipient (To)' },
    { name: 'subject', type: 'text', label: 'Subject' },
    { name: 'body', type: 'textarea', label: 'Email Body' }
  ]
});

registerNode({
  type: 'CalendarNode',
  name: 'Google Calendar',
  description: 'Schedules and manages Google Calendar events.',
  icon: MailOutlineIcon,
  inputs: ['input'],
  outputs: ['output'],
  headerClass: 'integration',
  configFields: [
    { name: 'summary', type: 'text', label: 'Event Summary' },
    { name: 'attendees', type: 'text', label: 'Attendees (Emails)' },
    { name: 'duration', type: 'text', label: 'Duration (Minutes)' }
  ]
});

registerNode({
  type: 'SheetsNode',
  name: 'Google Sheets',
  description: 'Appends data columns or updates Google Sheets cells.',
  icon: StorageIcon,
  inputs: ['input'],
  outputs: ['output'],
  headerClass: 'integration',
  configFields: [
    { name: 'spreadsheetId', type: 'text', label: 'Spreadsheet ID' },
    { name: 'sheetName', type: 'text', label: 'Sheet Name' },
    { name: 'rowValues', type: 'text', label: 'Row Values (JSON)' }
  ]
});

registerNode({
  type: 'CallLogNode',
  name: 'RingCentral Calls',
  description: 'Fetches communications log history from RingCentral.',
  icon: PhoneInTalkIcon,
  inputs: ['input'],
  outputs: ['missed', 'completed'],
  headerClass: 'integration',
  configFields: [
    { name: 'userId', type: 'text', label: 'Employee RingCentral ID' }
  ]
});

registerNode({
  type: 'SMSNode',
  name: 'RingCentral SMS',
  description: 'Dispatches custom SMS notification packets.',
  icon: PhoneInTalkIcon,
  inputs: ['input'],
  outputs: ['output'],
  headerClass: 'integration',
  configFields: [
    { name: 'phone', type: 'text', label: 'Phone Number' },
    { name: 'message', type: 'textarea', label: 'SMS Content' }
  ]
});

registerNode({
  type: 'SlackNode',
  name: 'Slack Alerts',
  description: 'Broadcasts notifications onto an internal Slack channel.',
  icon: MailOutlineIcon,
  inputs: ['input'],
  outputs: ['output'],
  headerClass: 'integration',
  configFields: [
    { name: 'channel', type: 'text', label: 'Slack Channel Name' },
    { name: 'body', type: 'textarea', label: 'Alert Details' }
  ]
});


/* =========================================================
   7. FILES & DOCUMENTS CATEGORY (NEW MODULE)
   ========================================================= */

// --- FILE INPUTS ---
const fileInputs = [
  { type: 'FileUploadNode', name: 'File Upload Node', desc: 'Accepts drag-and-drop file attachments.' },
  { type: 'LocalFileNode', name: 'Local File Node', desc: 'Reads files from local directory paths.' },
  { type: 'GoogleDriveFileNode', name: 'Google Drive File', desc: 'Downloads folder files from Google Drive.' },
  { type: 'DropboxFileNode', name: 'Dropbox File Node', desc: 'Downloads assets from a Dropbox folder.' },
  { type: 'OneDriveFileNode', name: 'OneDrive File Node', desc: 'Pulls document files from OneDrive folders.' },
  { type: 'SharePointFileNode', name: 'SharePoint File Node', desc: 'Fetches files from SharePoint directory.' },
  { type: 'S3FileNode', name: 'S3 File Node', desc: 'Pulls buckets objects from Amazon AWS S3.' },
  { type: 'FTPFileNode', name: 'FTP File Node', desc: 'Downloads directories files via FTP/SFTP.' },
  { type: 'WebhookFileUploadNode', name: 'Webhook File Upload', desc: 'Triggers on incoming multipart files POST.' },
  { type: 'EmailAttachmentNode', name: 'Email Attachment Node', desc: 'Extracts attachment files from email inboxes.' },
  { type: 'FolderWatcherNode', name: 'Folder Watcher Node', desc: 'Watches a directory for new file additions.' },
  { type: 'FolderMonitorNode', name: 'Folder Monitor Node', desc: 'Checks folder state at interval steps.' }
];
fileInputs.forEach(f => {
  registerNode({
    type: f.type,
    name: f.name,
    description: f.desc,
    icon: FolderOpenIcon,
    inputs: f.type.includes('Trigger') || f.type.includes('Watcher') || f.type.includes('Monitor') ? [] : ['input'],
    outputs: ['output'],
    headerClass: 'files',
    configFields: [
      { name: 'fileName', type: 'text', label: 'File Target Name' },
      { name: 'filePath', type: 'text', label: 'Directory Path' }
    ]
  });
});

// --- PDF NODES ---
const pdfNodes = [
  { type: 'PDFReaderNode', name: 'PDF Reader Node', desc: 'Loads PDF page text structures.' },
  { type: 'PDFExtractTextNode', name: 'PDF Extract Text', desc: 'Extracts unicode text sequences from PDF.' },
  { type: 'PDFOCRNode', name: 'PDF OCR Node', desc: 'Performs OCR text extraction on scanned PDFs.' },
  { type: 'PDFSplitNode', name: 'PDF Split Node', desc: 'Splits multi-page PDFs into separate files.' },
  { type: 'PDFMergeNode', name: 'PDF Merge Node', desc: 'Merges multiple PDFs into one document.' },
  { type: 'PDFCompressNode', name: 'PDF Compress Node', desc: 'Reduces size bytes footprint of a PDF.' },
  { type: 'PDFMetadataNode', name: 'PDF Metadata Node', desc: 'Extracts authors, pages, and signature markers.' },
  { type: 'PDFSignatureVerificationNode', name: 'PDF Signature Verify', desc: 'Checks validity of signed PDF hashes.' },
  { type: 'PDFAIAnalysisNode', name: 'PDF AI Analysis Node', desc: 'Asks context questions about PDF terms.' },
  { type: 'PDFSummarizationNode', name: 'PDF Summarizer Node', desc: 'Creates textual outlines of PDF content.' }
];
pdfNodes.forEach(f => {
  registerNode({
    type: f.type,
    name: f.name,
    description: f.desc,
    icon: PictureAsPdfIcon,
    inputs: ['input'],
    outputs: ['output'],
    headerClass: 'files',
    configFields: [
      { name: 'fileUrl', type: 'text', label: 'PDF File Path/URL' },
      { name: 'pages', type: 'text', label: 'Page Ranges (e.g. 1-3)' }
    ]
  });
});

// --- EXCEL NODES ---
const excelNodes = [
  { type: 'ExcelReadNode', name: 'Excel Read Node', desc: 'Loads row data sheets from spreadsheet files.' },
  { type: 'ExcelWriteNode', name: 'Excel Write Node', desc: 'Writes grid cell arrays into Excel sheets.' },
  { type: 'ExcelAppendNode', name: 'Excel Append Node', desc: 'Appends data rows at sheet bottom bounds.' },
  { type: 'ExcelUpdateNode', name: 'Excel Update Node', desc: 'Updates target cell rows matching key filter.' },
  { type: 'ExcelFormulaNode', name: 'Excel Formula Node', desc: 'Resolves cell formulas in active sheets.' },
  { type: 'ExcelSheetReaderNode', name: 'Excel Sheet Reader', desc: 'Reads tab schema index pages.' },
  { type: 'ExcelMultiSheetProcessor', name: 'Excel Multi-Sheet Proc', desc: 'Loops across multiple sheets tabs.' },
  { type: 'ExcelValidatorNode', name: 'Excel Validator Node', desc: 'Checks values types and required cells.' },
  { type: 'ExcelDataCleanerNode', name: 'Excel Data Cleaner', desc: 'De-duplicates rows and trims spaces.' },
  { type: 'ExcelReportGeneratorNode', name: 'Excel Report Node', desc: 'Generates tabular spreadsheet reports.' }
];
excelNodes.forEach(f => {
  registerNode({
    type: f.type,
    name: f.name,
    description: f.desc,
    icon: GridOnIcon,
    inputs: ['input'],
    outputs: ['output'],
    headerClass: 'files',
    configFields: [
      { name: 'sheetName', type: 'text', label: 'Target Sheet Tab' },
      { name: 'range', type: 'text', label: 'Cell Range (e.g. A1:D100)' }
    ]
  });
});

// --- CSV NODES ---
const csvNodes = [
  { type: 'CSVReaderNode', name: 'CSV Reader Node', desc: 'Loads and parses comma-separated files.' },
  { type: 'CSVWriterNode', name: 'CSV Writer Node', desc: 'Compiles JSON arrays into CSV layouts.' },
  { type: 'CSVCleanerNode', name: 'CSV Cleaner Node', desc: 'Trims spacing and resolves missing values.' },
  { type: 'CSVValidatorNode', name: 'CSV Validator Node', desc: 'Validates row formats against schema lists.' },
  { type: 'CSVTransformerNode', name: 'CSV Transformer', desc: 'Applies column mapping filters on CSVs.' },
  { type: 'CSVExportNode', name: 'CSV Export Node', desc: 'Exports CSV data to local storage nodes.' },
  { type: 'CSVImportNode', name: 'CSV Import Node', desc: 'Loads CSV inputs into flow variables.' }
];
csvNodes.forEach(f => {
  registerNode({
    type: f.type,
    name: f.name,
    description: f.desc,
    icon: GridOnIcon,
    inputs: ['input'],
    outputs: ['output'],
    headerClass: 'files',
    configFields: [
      { name: 'delimiter', type: 'select', label: 'Delimiter', options: [',', ';', '\\t'] }
    ]
  });
});

// --- WORD NODES ---
const wordNodes = [
  { type: 'WordReaderNode', name: 'Word Reader Node', desc: 'Extracts paragraphs from .docx documents.' },
  { type: 'WordWriterNode', name: 'Word Writer Node', desc: 'Writes textual logs into Docx templates.' },
  { type: 'DocumentGeneratorNode', name: 'Document Generator', desc: 'Assembles DOCX agreements from parameters.' },
  { type: 'TemplateProcessorNode', name: 'Template Processor', desc: 'Interpolates template tags in documents.' },
  { type: 'ContractGeneratorNode', name: 'Contract Generator', desc: 'Generates client contract documents.' },
  { type: 'PolicyGeneratorNode', name: 'Policy Generator', desc: 'Assembles employee policy documents.' },
  { type: 'ReportGeneratorNode', name: 'Word Report Generator', desc: 'Builds comprehensive operations reports.' }
];
wordNodes.forEach(f => {
  registerNode({
    type: f.type,
    name: f.name,
    description: f.desc,
    icon: DescriptionIcon,
    inputs: ['input'],
    outputs: ['output'],
    headerClass: 'files',
    configFields: [
      { name: 'templateType', type: 'select', label: 'Document Type', options: ['Contract', 'Policy', 'Report'] }
    ]
  });
});

// --- IMAGE PROCESSING ---
const imageNodes = [
  { type: 'ImageUploadNode', name: 'Image Upload Node', desc: 'Loads visual image assets.' },
  { type: 'OCRExtractionNode', name: 'OCR Extraction Node', desc: 'Extracts alphanumeric characters.' },
  { type: 'ImageMetadataNode', name: 'Image Metadata Node', desc: 'Reads dimensions and GPS metrics.' },
  { type: 'ImageResizeNode', name: 'Image Resize Node', desc: 'Resizes pixel heights and widths.' },
  { type: 'ImageCompressionNode', name: 'Image Compress', desc: 'Reduces KB footprints of images.' },
  { type: 'ImageClassificationNode', name: 'Image Classify', desc: 'Categorizes images into tags.' },
  { type: 'AIImageAnalyzerNode', name: 'AI Image Analyzer', desc: 'Queries models for details inside images.' },
  { type: 'DocumentScannerNode', name: 'Document Scanner', desc: 'Processes receipts visual checks.' }
];
imageNodes.forEach(f => {
  registerNode({
    type: f.type,
    name: f.name,
    description: f.desc,
    icon: ImageIcon,
    inputs: ['input'],
    outputs: ['output'],
    headerClass: 'files',
    configFields: [
      { name: 'imagePath', type: 'text', label: 'Image URL/Path' }
    ]
  });
});

// --- AUDIO PROCESSING ---
const audioNodes = [
  { type: 'AudioUploadNode', name: 'Audio Upload Node', desc: 'Loads raw sound record assets.' },
  { type: 'SpeechToTextNode', name: 'Speech To Text Node', desc: 'Transcribes spoken words.' },
  { type: 'MeetingTranscriptNode', name: 'Meeting Transcript', desc: 'Parses meeting recordings into text.' },
  { type: 'AudioSummarizerNode', name: 'Audio Summarizer', desc: 'Synthesizes conversation details.' },
  { type: 'AudioClassificationNode', name: 'Audio Classification', desc: 'Detects speaker profiles.' }
];
audioNodes.forEach(f => {
  registerNode({
    type: f.type,
    name: f.name,
    description: f.desc,
    icon: AudiotrackIcon,
    inputs: ['input'],
    outputs: ['output'],
    headerClass: 'files',
    configFields: [
      { name: 'audioUrl', type: 'text', label: 'Audio File URL/Path' }
    ]
  });
});

// --- VIDEO PROCESSING ---
const videoNodes = [
  { type: 'VideoUploadNode', name: 'Video Upload Node', desc: 'Loads video records files.' },
  { type: 'VideoMetadataNode', name: 'Video Metadata Node', desc: 'Pulls framerate and codecs.' },
  { type: 'VideoTranscriptionNode', name: 'Video Transcribe', desc: 'Extracts text tracks from video files.' },
  { type: 'VideoSummarizerNode', name: 'Video Summarizer', desc: 'Creates notes from visual captures.' },
  { type: 'VideoFrameExtractorNode', name: 'Video Frame Extractor', desc: 'Pulls periodic screenshots.' }
];
videoNodes.forEach(f => {
  registerNode({
    type: f.type,
    name: f.name,
    description: f.desc,
    icon: VideoLibraryIcon,
    inputs: ['input'],
    outputs: ['output'],
    headerClass: 'files',
    configFields: [
      { name: 'videoUrl', type: 'text', label: 'Video File URL/Path' }
    ]
  });
});

// --- AI KNOWLEDGE INGESTION ---
const ingestionNodes = [
  { type: 'DocumentLoaderNode', name: 'Document Loader Node', desc: 'Prepares raw files for vector stores.' },
  { type: 'KnowledgeBaseLoaderNode', name: 'KB Loader Node', desc: 'Loads folder directories of text.' },
  { type: 'EmbeddingGeneratorNode', name: 'Embedding Gen', desc: 'Transforms sentences into vectors.' },
  { type: 'VectorStoreWriterNode', name: 'Vector Store Writer', desc: 'Saves embeddings into DB nodes.' },
  { type: 'ChunkProcessorNode', name: 'Chunk Processor', desc: 'Segments paragraphs into chunks.' },
  { type: 'RAGPreparationNode', name: 'RAG Preparation', desc: 'Tags files with metadata indexes.' },
  { type: 'SemanticIndexerNode', name: 'Semantic Indexer', desc: 'Resolves index references.' },
  { type: 'KnowledgeSyncNode', name: 'Knowledge Sync Node', desc: 'Syncs vector databases.' }
];
ingestionNodes.forEach(f => {
  registerNode({
    type: f.type,
    name: f.name,
    description: f.desc,
    icon: PsychologyIcon,
    inputs: ['input'],
    outputs: ['output'],
    headerClass: 'files',
    configFields: [
      { name: 'chunkSize', type: 'text', label: 'Chunk Size (Characters)' },
      { name: 'overlap', type: 'text', label: 'Chunk Overlap' }
    ]
  });
});

// --- VECTOR DATABASES ---
const vectorDbNodes = [
  { type: 'ChromaDBNode', name: 'ChromaDB Node', desc: 'Ingests or queries ChromaDB vector databases.' },
  { type: 'PineconeNode', name: 'Pinecone Node', desc: 'Queries Pinecone cosine similarity vectors.' },
  { type: 'WeaviateNode', name: 'Weaviate Node', desc: 'Queries Weaviate hybrid semantic stores.' },
  { type: 'QdrantNode', name: 'Qdrant Node', desc: 'Queries Qdrant high performance databases.' },
  { type: 'MilvusNode', name: 'Milvus Node', desc: 'Interacts with corporate Milvus vector servers.' },
  { type: 'VectorSearchNode', name: 'Vector Search Node', desc: 'Retrieves top-k similar indices.' },
  { type: 'VectorInsertNode', name: 'Vector Insert Node', desc: 'Saves custom embedding rows.' },
  { type: 'VectorDeleteNode', name: 'Vector Delete Node', desc: 'Deletes indexes matching filters.' },
  { type: 'VectorUpdateNode', name: 'Vector Update Node', desc: 'Updates vector embeddings.' }
];
vectorDbNodes.forEach(f => {
  registerNode({
    type: f.type,
    name: f.name,
    description: f.desc,
    icon: StorageIcon,
    inputs: ['input'],
    outputs: ['output'],
    headerClass: 'files',
    configFields: [
      { name: 'provider', type: 'select', label: 'DB Vendor', options: ['Pinecone', 'Chroma', 'Weaviate', 'Qdrant', 'Milvus'] },
      { name: 'indexName', type: 'text', label: 'Index / Collection Name' }
    ]
  });
});

// --- TRANSFORMATION NODES ---
const transformNodes = [
  { type: 'ConvertPDFToText', name: 'Convert PDF To Text', desc: 'Converts PDF structures into text logs.' },
  { type: 'ConvertPDFToCSV', name: 'Convert PDF To CSV', desc: 'Converts tabular PDFs to CSV columns.' },
  { type: 'ConvertPDFToJSON', name: 'Convert PDF To JSON', desc: 'Extracts invoices PDFs to structured JSON.' },
  { type: 'ConvertExcelToCSV', name: 'Convert Excel To CSV', desc: 'Converts Excel sheet pages to CSV lines.' },
  { type: 'ConvertCSVToExcel', name: 'Convert CSV To Excel', desc: 'Transforms CSV documents to xlsx files.' },
  { type: 'ConvertWordToPDF', name: 'Convert Word To PDF', desc: 'Renders Docx documents into PDF agreements.' },
  { type: 'ConvertImageToPDF', name: 'Convert Image To PDF', desc: 'Compiles scanned images into PDF pages.' },
  { type: 'ConvertJSONToCSV', name: 'Convert JSON To CSV', desc: 'Flattens nested objects into CSV rows.' },
  { type: 'ConvertXMLToJSON', name: 'Convert XML To JSON', desc: 'Transforms XML files into JSON objects.' },
  { type: 'ConvertHTMLToMarkdown', name: 'Convert HTML To MD', desc: 'Converts HTML pages to Markdown logs.' }
];
transformNodes.forEach(f => {
  registerNode({
    type: f.type,
    name: f.name,
    description: f.desc,
    icon: SettingsSuggestIcon,
    inputs: ['input'],
    outputs: ['output'],
    headerClass: 'files',
    configFields: []
  });
});

// --- VALIDATION NODES ---
const validationNodes = [
  { type: 'SchemaValidator', name: 'Schema Validator', desc: 'Checks attributes formats against JSON Schemas.' },
  { type: 'FileIntegrityChecker', name: 'File Integrity check', desc: 'Computes SHA hashes to verify uploads.' },
  { type: 'DuplicateDetector', name: 'Duplicate Detector', desc: 'Finds duplicate rows in CSVs/Excels.' },
  { type: 'DataQualityChecker', name: 'Data Quality Checker', desc: 'Detects empty columns and errors.' },
  { type: 'RequiredFieldValidator', name: 'Required Fields', desc: 'Ensures required keys are present.' },
  { type: 'ComplianceChecker', name: 'Compliance Checker', desc: 'Verifies files adhere to safety templates.' }
];
validationNodes.forEach(f => {
  registerNode({
    type: f.type,
    name: f.name,
    description: f.desc,
    icon: FactCheckIcon,
    inputs: ['input'],
    outputs: ['valid', 'invalid'],
    headerClass: 'files',
    configFields: []
  });
});

// --- AI DOCUMENT NODES ---
const aiDocNodes = [
  { type: 'AISummarizationNode', name: 'AI Summarization', desc: 'Generates abstracts of long documents.' },
  { type: 'AIDataExtractionNode', name: 'AI Data Extraction', desc: 'Extracts target keys from raw texts.' },
  { type: 'AIClassificationNode', name: 'AI Classification', desc: 'Assigns document category tags.' },
  { type: 'AISentimentAnalysisNode', name: 'AI Sentiment Analysis', desc: 'Analyzes text emotional scores.' },
  { type: 'AIEntityExtractionNode', name: 'AI Entity Extract', desc: 'Extracts names, dates, and locations.' },
  { type: 'AIContractReviewNode', name: 'AI Contract Review', desc: 'Identifies contract liabilities.' },
  { type: 'AIResumeScreeningNode', name: 'AI Resume Screen', desc: 'Grades job applicant screening scores.' },
  { type: 'AIInvoiceProcessingNode', name: 'AI Invoice Processing', desc: 'Extracts billing values from invoices.' },
  { type: 'AITicketCategorizationNode', name: 'AI Ticket Category', desc: 'Grades tickets priority categories.' }
];
aiDocNodes.forEach(f => {
  registerNode({
    type: f.type,
    name: f.name,
    description: f.desc,
    icon: PsychologyIcon,
    inputs: ['input'],
    outputs: ['output'],
    headerClass: 'files',
    configFields: [
      { name: 'promptInstructions', type: 'textarea', label: 'AI Directives' }
    ]
  });
});


/* =========================================================
   8. UTILITIES CATEGORY
   ========================================================= */
registerNode({
  type: 'ConditionNode',
  name: 'Condition Branch',
  description: 'Routes variables conditionally along True/False outputs.',
  icon: HttpIcon,
  inputs: ['input'],
  outputs: ['true', 'false'],
  headerClass: 'utility',
  configFields: [
    { name: 'field', type: 'text', label: 'Variables Input Field' },
    { name: 'operator', type: 'select', label: 'Operator', options: ['equals', 'not_equals', 'greater_than', 'less_than', 'contains'] },
    { name: 'value', type: 'text', label: 'Comparison Value' }
  ]
});

registerNode({
  type: 'DelayNode',
  name: 'Execution Delay',
  description: 'Pauses operation loops for a specified time length.',
  icon: TimerIcon,
  inputs: ['input'],
  outputs: ['output'],
  headerClass: 'utility',
  configFields: [
    { name: 'delaySeconds', type: 'text', label: 'Duration (Seconds)' }
  ]
});

registerNode({
  type: 'ApprovalNode',
  name: 'Approval Gate',
  description: 'Suspends the DAG process loop awaiting manual click.',
  icon: TimerIcon,
  inputs: ['input'],
  outputs: ['approved', 'rejected'],
  headerClass: 'utility',
  configFields: []
});

registerNode({
  type: 'DatabaseNode',
  name: 'MongoDB Connection',
  description: 'Performs MongoDB read and write query collections.',
  icon: StorageIcon,
  inputs: ['input'],
  outputs: ['output'],
  headerClass: 'database',
  configFields: [
    { name: 'collection', type: 'select', label: 'Collection Name', options: ['Employee', 'Ticket', 'Lead', 'Deal'] },
    { name: 'filter', type: 'text', label: 'Filter Query (JSON)' }
  ]
});

registerNode({
  type: 'TransformNode',
  name: 'JSON Transform',
  description: 'Reformats or restructures variable attributes.',
  icon: LayersIcon,
  inputs: ['input'],
  outputs: ['output'],
  headerClass: 'utility',
  configFields: [
    { name: 'inputData', type: 'text', label: 'Input JSON' },
    { name: 'formatString', type: 'textarea', label: 'Mapping Logic' }
  ]
});

// --- ADVANCED OPERATIONS WORKFLOW NODES ---

// Quality Node Category
registerNode({
  type: 'AgentEvaluatorNode',
  name: 'Agent Quality Evaluator',
  description: 'Continuously measures AI Agent accuracy rates.',
  icon: FactCheckIcon,
  inputs: ['input'],
  outputs: ['output'],
  headerClass: 'quality',
  configFields: [
    { name: 'agentName', type: 'text', label: 'AI Agent ID / Name' }
  ]
});

registerNode({
  type: 'OutputValidatorNode',
  name: 'Agent Output Validator',
  description: 'Runs hallucination check heuristics on agent output.',
  icon: FactCheckIcon,
  inputs: ['input'],
  outputs: ['valid', 'invalid'],
  headerClass: 'quality',
  configFields: []
});

registerNode({
  type: 'ConfidenceScorerNode',
  name: 'Agent Confidence Scorer',
  description: 'Computes probability-confidence parameters.',
  icon: FactCheckIcon,
  inputs: ['input'],
  outputs: ['output'],
  headerClass: 'quality',
  configFields: []
});

registerNode({
  type: 'HumanReviewTriggerNode',
  name: 'Human Override Trigger',
  description: 'Triggers manual review when confidence is low.',
  icon: FactCheckIcon,
  inputs: ['input'],
  outputs: ['approved', 'rejected'],
  headerClass: 'quality',
  configFields: []
});

// Sync Node Category
registerNode({
  type: 'SyncForceNode',
  name: 'HubSpot-Supabase Force Sync',
  description: 'Triggers instantaneous bi-directional database sync.',
  icon: CompareArrowsIcon,
  inputs: ['input'],
  outputs: ['output'],
  headerClass: 'sync',
  configFields: []
});

registerNode({
  type: 'SyncStatusNode',
  name: 'Sync Health Check',
  description: 'Monitors database sync health status indices.',
  icon: CompareArrowsIcon,
  inputs: ['input'],
  outputs: ['healthy', 'failed'],
  headerClass: 'sync',
  configFields: []
});

// Coaching Node Category
registerNode({
  type: 'CoachingReportGenNode',
  name: 'AI Coaching Report Gen',
  description: 'Generates daily staff coaching recommendations.',
  icon: PlaylistAddCheckIcon,
  inputs: ['input'],
  outputs: ['output'],
  headerClass: 'coaching',
  configFields: [
    { name: 'department', type: 'select', label: 'Department', options: ['Sales', 'HR', 'Customer Service', 'BCO', 'Management'] },
    { name: 'reportType', type: 'select', label: 'Period', options: ['Daily', 'Weekly', 'Monthly'] }
  ]
});

// Process Mining Node Category
registerNode({
  type: 'ProcessMineNode',
  name: 'Process Mining Check',
  description: 'Checks workflow logs to detect process bottlenecks.',
  icon: SettingsSuggestIcon,
  inputs: ['input'],
  outputs: ['detected', 'clear'],
  headerClass: 'process_mining',
  configFields: []
});

// Marketplace Node Category
registerNode({
  type: 'MarketplaceActionNode',
  name: 'Install Marketplace Agent',
  description: 'Installs or updates a pre-built agent template.',
  icon: PsychologyIcon,
  inputs: ['input'],
  outputs: ['output'],
  headerClass: 'marketplace',
  configFields: [
    { name: 'templateId', type: 'text', label: 'Template ID / Name' }
  ]
});

// Prompts Node Category
registerNode({
  type: 'PromptVersionRunNode',
  name: 'Execute Prompt Template',
  description: 'Loads and executes a versioned system prompt.',
  icon: AutoAwesomeIcon,
  inputs: ['input'],
  outputs: ['output'],
  headerClass: 'prompts',
  configFields: [
    { name: 'promptName', type: 'text', label: 'Prompt Registry Name' },
    { name: 'version', type: 'text', label: 'Version ID' }
  ]
});

// Cost Tracking Node Category
registerNode({
  type: 'CostTrackNode',
  name: 'Track AI Model Cost',
  description: 'Logs API tokens and vectors usage charges.',
  icon: StorageIcon,
  inputs: ['input'],
  outputs: ['output'],
  headerClass: 'cost_tracking',
  configFields: [
    { name: 'provider', type: 'select', label: 'Model Provider', options: ['OpenAI', 'Anthropic', 'Gemini', 'VectorStore'] }
  ]
});

// N8N Migration Node Category
registerNode({
  type: 'N8NMigrateNode',
  name: 'Import n8n Flow',
  description: 'Parses and converts n8n flow schemas.',
  icon: LayersIcon,
  inputs: ['input'],
  outputs: ['output'],
  headerClass: 'n8n_migration',
  configFields: [
    { name: 'flowJson', type: 'textarea', label: 'n8n JSON Schema' }
  ]
});

// Supabase Node Category
registerNode({
  type: 'SupabaseQueryNode',
  name: 'Execute Supabase Query',
  description: 'Runs operations query on Supabase tables.',
  icon: StorageIcon,
  inputs: ['input'],
  outputs: ['output'],
  headerClass: 'supabase',
  configFields: [
    { name: 'query', type: 'textarea', label: 'SQL Query Command' }
  ]
});

// Operations Node Category
registerNode({
  type: 'OperationsMonitorNode',
  name: 'Operations Command Sync',
  description: 'Logs metrics on operations dashboard queues.',
  icon: HubIcon,
  inputs: ['input'],
  outputs: ['output'],
  headerClass: 'operations',
  configFields: []
});

// Feedback Node Category
registerNode({
  type: 'ChatbotFeedbackRateNode',
  name: 'Log Chatbot Feedback',
  description: 'Saves answer quality reviews thumbs ratings.',
  icon: FactCheckIcon,
  inputs: ['input'],
  outputs: ['output'],
  headerClass: 'feedback',
  configFields: []
});

// Executive AI Node Category
registerNode({
  type: 'ExecutiveAIQueryNode',
  name: 'Executive NLP Query',
  description: 'Processes executive natural language operations queries.',
  icon: PsychologyIcon,
  inputs: ['input'],
  outputs: ['output'],
  headerClass: 'executive_ai',
  configFields: [
    { name: 'prompt', type: 'textarea', label: 'NLP Query Instructions' }
  ]
});

// Testing Node Category
registerNode({
  type: 'TestingLabRunNode',
  name: 'Agent Lab Simulator',
  description: 'Performs sandbox scenario load testing.',
  icon: TimerIcon,
  inputs: ['input'],
  outputs: ['output'],
  headerClass: 'testing',
  configFields: []
});

// Audit Node Category
registerNode({
  type: 'AuditRecordCreateNode',
  name: 'Log Granular Audit',
  description: 'Saves database modifications log ledger.',
  icon: FactCheckIcon,
  inputs: ['input'],
  outputs: ['output'],
  headerClass: 'audit',
  configFields: [
    { name: 'action', type: 'text', label: 'Audit Action Type' },
    { name: 'reason', type: 'text', label: 'Audit Reason' }
  ]
});

// Recovery Node Category
registerNode({
  type: 'SelfHealingActionNode',
  name: 'Self-Healing Circuit',
  description: 'Tracks failures and handles circuit breaker fallback retry policies.',
  icon: SettingsSuggestIcon,
  inputs: ['input'],
  outputs: ['recovered', 'failed'],
  headerClass: 'recovery',
  configFields: [
    { name: 'maxRetries', type: 'text', label: 'Max Recovery Retries' }
  ]
});


/* =========================================================
   16. ENTERPRISE DATA ANALYTICS CATEGORY
   ========================================================= */
registerNode({
  type: 'DataImportNode',
  name: 'Data Import Node',
  description: 'Imports records from an uploaded dataset or static source.',
  icon: StorageIcon,
  inputs: ['input'],
  outputs: ['output'],
  headerClass: 'analytics',
  configFields: [
    { name: 'datasetId', type: 'text', label: 'Dataset ID' },
    { name: 'limit', type: 'text', label: 'Max Records Ingest Limit' }
  ]
});

registerNode({
  type: 'CSVReaderNode',
  name: 'CSV Reader Node',
  description: 'Reads and parses uploaded CSV text data.',
  icon: DescriptionIcon,
  inputs: ['input'],
  outputs: ['output'],
  headerClass: 'analytics',
  configFields: [
    { name: 'delimiter', type: 'text', label: 'CSV Delimiter (Default: ,)' }
  ]
});

registerNode({
  type: 'ExcelReaderNode',
  name: 'Excel Reader Node',
  description: 'Ingests spreadsheet rows from Excel .xlsx files.',
  icon: GridOnIcon,
  inputs: ['input'],
  outputs: ['output'],
  headerClass: 'analytics',
  configFields: [
    { name: 'sheetName', type: 'text', label: 'Target Sheet Name' }
  ]
});

registerNode({
  type: 'DataCleanerNode',
  name: 'Data Cleaner Node',
  description: 'Applies missing values replacements and drop duplicates.',
  icon: SettingsSuggestIcon,
  inputs: ['input'],
  outputs: ['output'],
  headerClass: 'analytics',
  configFields: [
    { name: 'nullStrategy', type: 'select', label: 'Null Strategy', options: ['Zero Fill', 'Mean Fill', 'Drop Row'] }
  ]
});

registerNode({
  type: 'AggregationNode',
  name: 'Aggregation Node',
  description: 'Computes Count, Sum, Average, Median, Min, Max metrics.',
  icon: StorageIcon,
  inputs: ['input'],
  outputs: ['output'],
  headerClass: 'analytics',
  configFields: [
    { name: 'field', type: 'text', label: 'Target Column' },
    { name: 'operation', type: 'select', label: 'Aggregate Op', options: ['Sum', 'Average', 'Count', 'Max', 'Min'] }
  ]
});

registerNode({
  type: 'ForecastNode',
  name: 'Forecast Node',
  description: 'Applies ARIMA models to run time-series predictions.',
  icon: TimerIcon,
  inputs: ['input'],
  outputs: ['output'],
  headerClass: 'analytics',
  configFields: [
    { name: 'horizon', type: 'text', label: 'Prediction Period Horizon' }
  ]
});

registerNode({
  type: 'RegressionNode',
  name: 'Regression Node',
  description: 'Calculates linear regression equations and coefficients.',
  icon: CompareArrowsIcon,
  inputs: ['input'],
  outputs: ['output'],
  headerClass: 'analytics',
  configFields: [
    { name: 'targetY', type: 'text', label: 'Dependent Variable Y' },
    { name: 'predictorX', type: 'text', label: 'Independent Variable X' }
  ]
});

registerNode({
  type: 'ClusteringNode',
  name: 'Clustering Node',
  description: 'Groups records using K-Means clustering algorithm.',
  icon: HubIcon,
  inputs: ['input'],
  outputs: ['output'],
  headerClass: 'analytics',
  configFields: [
    { name: 'k', type: 'text', label: 'Clusters Count K' }
  ]
});

registerNode({
  type: 'VisualizationNode',
  name: 'Visualization Node',
  description: 'Renders charts (Bar, Line, Pie, Gauge, Scatter Plot).',
  icon: GridOnIcon,
  inputs: ['input'],
  outputs: ['output'],
  headerClass: 'analytics',
  configFields: [
    { name: 'chartType', type: 'select', label: 'Chart Type', options: ['Bar Chart', 'Line Chart', 'Pie Chart', 'Scatter Plot', 'Gauge'] }
  ]
});

registerNode({
  type: 'DashboardNode',
  name: 'Dashboard Node',
  description: 'Updates active dashboard layouts with fresh aggregates.',
  icon: LayersIcon,
  inputs: ['input'],
  outputs: ['output'],
  headerClass: 'analytics',
  configFields: [
    { name: 'dashboardTitle', type: 'text', label: 'Dashboard Target Title' }
  ]
});

registerNode({
  type: 'ReportGeneratorNode',
  name: 'Report Generator Node',
  description: 'Compiles PDF, Excel, or Word branded summary logs.',
  icon: PictureAsPdfIcon,
  inputs: ['input'],
  outputs: ['output'],
  headerClass: 'analytics',
  configFields: [
    { name: 'format', type: 'select', label: 'Report Format', options: ['PDF', 'Excel', 'Word', 'CSV'] }
  ]
});

registerNode({
  type: 'ShareReportNode',
  name: 'Share Report Node',
  description: 'Generates secure password-protected sharing URLs.',
  icon: HttpIcon,
  inputs: ['input'],
  outputs: ['output'],
  headerClass: 'analytics',
  configFields: [
    { name: 'expiryDays', type: 'text', label: 'Expiry Days Limit' },
    { name: 'password', type: 'text', label: 'Access Password (Optional)' }
  ]
});

registerNode({
  type: 'AIAnalyticsNode',
  name: 'AI Analytics Node',
  description: 'Queries data logs using NLP semantic evaluations.',
  icon: PsychologyIcon,
  inputs: ['input'],
  outputs: ['output'],
  headerClass: 'analytics',
  configFields: [
    { name: 'nlpPrompt', type: 'text', label: 'AI Question' }
  ]
});



/* =========================================================
   BASE NODE WRAPPER COMPONENT
   ========================================================= */
export const BaseNodeComponent = ({ id, data }) => {
  const spec = nodeRegistry[data.type] || {
    name: 'Generic Node',
    description: 'Unknown type node',
    icon: HubIcon,
    inputs: ['input'],
    outputs: ['output'],
    headerClass: 'utility'
  };

  const IconComponent = spec.icon;
  const status = data.status || ''; // Running, Completed, Failed, Skipped, Pending
  
  const getStatusBorderClass = () => {
    if (!status) return '';
    return `status-${status.toLowerCase()}`;
  };

  return (
    <div className={`workflow-node-base ${getStatusBorderClass()}`}>
      {/* Input Handles */}
      {spec.inputs.map((inputName, idx) => {
        const topPercentage = `${((idx + 1) * 100) / (spec.inputs.length + 1)}%`;
        return (
          <div key={inputName} style={{ position: 'absolute', left: '-12px', top: topPercentage, display: 'flex', alignItems: 'center' }}>
            <Handle
              type="target"
              position={Position.Left}
              id={inputName}
              className="custom-flow-handle left"
            />
          </div>
        );
      })}

      {/* Node Header */}
      <div className={`workflow-node-header ${spec.headerClass}`}>
        <IconComponent sx={{ fontSize: 13, marginRight: 0.5 }} />
        <span style={{ flexGrow: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {data.name || spec.name}
        </span>
        {status && (
          <span style={{ fontSize: '7px', background: '#ffffff', color: '#111827', padding: '1px 3px', borderRadius: '2px', fontWeight: 'bold' }}>
            {status}
          </span>
        )}
      </div>

      {/* Node Body */}
      <div className="workflow-node-body">
        <Typography variant="caption" sx={{ display: 'block', fontSize: '9px', lineHeight: 1.1, color: '#6b7280', mb: 0.5 }}>
          {spec.description}
        </Typography>
        
        {/* Simple details summary */}
        {data.config && Object.keys(data.config).length > 0 && (
          <Box sx={{ background: '#f3f4f6', p: 0.25, borderRadius: '2px', fontSize: '8px', wordBreak: 'break-all', color: '#374151' }}>
            {Object.entries(data.config)
              .filter(([key, val]) => val && typeof val !== 'object' && key !== 'sampleContent')
              .map(([key, val]) => (
                <div key={key}>
                  <strong>{key}:</strong> {String(val).substring(0, 30)}
                </div>
              ))}
          </Box>
        )}
        
        {/* Error State */}
        {data.error && (
          <Typography variant="caption" sx={{ display: 'block', color: '#EF4444', fontSize: '8px', fontWeight: 'bold', mt: 0.5 }}>
            Error: {data.error}
          </Typography>
        )}
      </div>

      {/* Output Handles */}
      {spec.outputs.map((outputName, idx) => {
        const topPercentage = `${((idx + 1) * 100) / (spec.outputs.length + 1)}%`;
        return (
          <div key={outputName} style={{ position: 'absolute', right: '-12px', top: topPercentage, display: 'flex', alignItems: 'center' }}>
            {spec.outputs.length > 1 && (
              <span style={{ fontSize: '7px', color: '#fff', backgroundColor: '#57B9FF', padding: '1px 2px', borderRadius: '2px', marginRight: '6px' }}>
                {outputName}
              </span>
            )}
            <Handle
              type="source"
              position={Position.Right}
              id={outputName}
              className="custom-flow-handle right"
            />
          </div>
        );
      })}
    </div>
  );
};
