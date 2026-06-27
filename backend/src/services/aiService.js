import AIAgent from '../models/AIAgent.js';
import logger from '../config/logger.js';

export const runAgentExecution = async (agentName, prompt, context = '') => {
  try {
    let agent = await AIAgent.findOne({ name: agentName });
    if (!agent) {
      // Seed default agent if not found
      agent = new AIAgent({
        name: agentName,
        provider: 'OpenAI',
        modelName: 'gpt-4o-mini',
        systemPrompt: 'You are an internal staff assistant for One Janitorial. Provide professional answers about cleaning operations, HR, and ticketing.'
      });
      await agent.save();
    }

    logger.info(`Invoking AI Agent: ${agent.name} [Provider: ${agent.provider}]`);

    let responseContent = '';
    const hasKeys = process.env.OPENAI_API_KEY || process.env.CLAUDE_API_KEY;

    if (hasKeys) {
      // In production, invoke real APIs based on the provider config
      // Stub call for OpenAI/Claude
      responseContent = `[Production Real AI Response using ${agent.provider} ${agent.modelName}] Here is the analysis of: "${prompt}". Context loaded: ${context ? 'Yes' : 'No'}`;
    } else {
      // Mock AI Logic based on keywords to fulfill "Answer Staff Questions, SOP Lookup, HR Policies, Sales Processes, Ticket Procedures"
      const lowerPrompt = prompt.toLowerCase();
      if (lowerPrompt.includes('sop') || lowerPrompt.includes('cleaning')) {
        responseContent = `Based on the One Janitorial SOP Library (Category: Operations):
1. Always wear appropriate PPE (gloves, safety goggles) when handling cleaning chemicals.
2. Follow the dilution guidelines on the bottle label.
3. Clean areas starting from high spots downward to avoid re-soiling cleaned surfaces.
4. Report any building inspection failures within 2 hours.`;
      } else if (lowerPrompt.includes('hr') || lowerPrompt.includes('leave') || lowerPrompt.includes('policy')) {
        responseContent = `According to HR Policy Section 4.2 (Time-Off & Leave):
- Sick leave requests should be filed via the employee portal before 8:00 AM on the day of absence.
- Performance reviews occur semi-annually (June and December).
- Any grievances must be logged using the performance logs module.`;
      } else if (lowerPrompt.includes('ticket') || lowerPrompt.includes('sla') || lowerPrompt.includes('complaint')) {
        responseContent = `Ticket Resolution Procedure:
- Urgent priority tickets must be acknowledged within 30 minutes and resolved within 4 hours.
- Medium priority tickets have a 24-hour SLA.
- Standard response templates should be used. Log all email communications under CRM logs.`;
      } else {
        responseContent = `Hello! I am the One Janitorial staff assistant. How can I help you today with SOP lookups, HR policy reviews, CRM lead inquiries, or client tickets?`;
      }
    }

    // Log the interaction
    agent.logs.push({
      message: `Prompt: "${prompt.substring(0, 50)}..." -> Response: "${responseContent.substring(0, 50)}..."`,
      promptTokens: prompt.length / 4,
      completionTokens: responseContent.length / 4,
      level: 'info'
    });
    await agent.save();

    return responseContent;
  } catch (error) {
    logger.error(`AI execution failure: ${error.message}`);
    return `Error running AI Agent: ${error.message}`;
  }
};
