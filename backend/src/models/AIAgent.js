import mongoose from 'mongoose';

const aiAgentSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  provider: {
    type: String,
    enum: ['OpenAI', 'Claude', 'CrewAI', 'LangChain', 'AutoGen', 'OpenClaw'],
    required: true
  },
  modelName: { type: String, default: 'gpt-4' },
  systemPrompt: { type: String, required: true },
  status: { type: String, enum: ['Active', 'Idle', 'Maintenance', 'Error'], default: 'Active' },
  healthCheck: {
    lastCheck: { type: Date, default: Date.now },
    status: { type: String, enum: ['Healthy', 'Degraded', 'Unhealthy'], default: 'Healthy' }
  },
  logs: [{
    timestamp: { type: Date, default: Date.now },
    level: { type: String, enum: ['info', 'warning', 'error'], default: 'info' },
    message: String,
    promptTokens: Number,
    completionTokens: Number
  }],
  // NEW FIELDS FOR WORKFLOW MULTI-AGENT ORCHESTRATION
  role: { 
    type: String, 
    enum: ['Supervisor', 'Worker', 'Reviewer', 'Planner'], 
    default: 'Worker' 
  },
  goals: [{ type: String }],
  tools: [{ type: String }],
  actions: [{ type: String }],
  memory: {
    type: { type: String, default: 'buffer' },
    windowSize: { type: Number, default: 10 }
  },
  knowledgeBase: [{ type: String }],
  reasoning: { type: String, default: 'ReAct' }, // e.g. ReAct, Plan-and-Solve, Chain-of-Thought
  workers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'AIAgent' }]
}, { timestamps: true });

export default mongoose.model('AIAgent', aiAgentSchema);
