import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardActions,
  Grid,
  Typography,
  Chip
} from '@mui/material';

import ShopIcon from '@mui/icons-material/Shop';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

// Mock visual DAG configurations for one-click installation templates
const templates = [
  {
    id: 'tpl-closed-won',
    name: 'Closed Won Onboarding Follow-Up',
    description: 'Triggers on CRM deal Closed Won. Waits 3 days, generates a personalized onboarding plan using AI, drafts the email, and logs action details back to HubSpot.',
    category: 'Sales Automation',
    nodes: [
      { id: 'node_1', type: 'HubSpotTrigger', position: { x: 50, y: 150 }, data: { name: 'HubSpot Trigger', type: 'HubSpotTrigger', config: { triggerType: 'Deal Closed Won' } } },
      { id: 'node_2', type: 'DelayNode', position: { x: 300, y: 150 }, data: { name: 'Wait 3 Days', type: 'DelayNode', config: { delaySeconds: '259200' } } },
      { id: 'node_3', type: 'OpenAINode', position: { x: 550, y: 150 }, data: { name: 'AI Email Draft', type: 'OpenAINode', config: { systemPrompt: 'Draft onboarding instructions.', prompt: 'Create onboarding outline for client {{trigger.clientEmail}}.' } } },
      { id: 'node_4', type: 'GmailNode', position: { x: 800, y: 150 }, data: { name: 'Send Gmail', type: 'GmailNode', config: { to: '{{trigger.clientEmail}}', subject: 'Welcome to One Janitorial!', body: '{{node_3.reply}}' } } }
    ],
    edges: [
      { id: 'edge_1', source: 'node_1', target: 'node_2', markerEnd: { type: 'arrowclosed' } },
      { id: 'edge_2', source: 'node_2', target: 'node_3', markerEnd: { type: 'arrowclosed' } },
      { id: 'edge_3', source: 'node_3', target: 'node_4', markerEnd: { type: 'arrowclosed' } }
    ]
  },
  {
    id: 'tpl-lead-hygiene',
    name: 'CRM Lead Round-Robin Hygiene',
    description: 'Monitors CRM database logs for inactive leads, verifies they are not flagged DNC, and distributes them automatically to active sales agents.',
    category: 'Sales Automation',
    nodes: [
      { id: 'n_1', type: 'SchedulerNode', position: { x: 50, y: 150 }, data: { name: 'Daily CRON', type: 'SchedulerNode', config: { cron: '0 9 * * *' } } },
      { id: 'n_2', type: 'DatabaseNode', position: { x: 280, y: 150 }, data: { name: 'Get Inactive Leads', type: 'DatabaseNode', config: { collection: 'Lead', filter: '{"status":"Inactive"}' } } },
      { id: 'n_3', type: 'ConditionNode', position: { x: 520, y: 150 }, data: { name: 'Check Hygiene Flag', type: 'ConditionNode', config: { field: '{{n_2.count}}', operator: 'greater_than', value: '0' } } },
      { id: 'n_4', type: 'CRMNode', position: { x: 800, y: 80 }, data: { name: 'Reassign Leads', type: 'CRMNode', config: { actionType: 'update_deal', stage: 'Round Robin Queue' } } },
      { id: 'n_5', type: 'SlackNode', position: { x: 800, y: 250 }, data: { name: 'Slack Alert', type: 'SlackNode', config: { channel: '#sales-pipeline', body: 'Lead hygiene completed. No inactive leads.' } } }
    ],
    edges: [
      { id: 'e_1', source: 'n_1', target: 'n_2', markerEnd: { type: 'arrowclosed' } },
      { id: 'e_2', source: 'n_2', target: 'n_3', markerEnd: { type: 'arrowclosed' } },
      { id: 'e_3', source: 'n_3', target: 'n_4', sourceHandle: 'true', markerEnd: { type: 'arrowclosed' } },
      { id: 'e_4', source: 'n_3', target: 'n_5', sourceHandle: 'false', markerEnd: { type: 'arrowclosed' } }
    ]
  },
  {
    id: 'tpl-candidate-screening',
    name: 'HR Resume Screening & Parsing',
    description: 'Triggered when applicants submit resumes. Automatically runs OCR and parsing algorithms, runs an AI screening rubric assessment, and flags alerts.',
    category: 'HR Automation',
    nodes: [
      { id: 'hr_1', type: 'TriggerNode', position: { x: 50, y: 150 }, data: { name: 'Job Application', type: 'TriggerNode', config: {} } },
      { id: 'hr_2', type: 'PDFParserNode', position: { x: 280, y: 150 }, data: { name: 'Parse Resume PDF', type: 'PDFParserNode', config: { filePath: '{{trigger.resumePath}}' } } },
      { id: 'hr_3', type: 'OpenAINode', position: { x: 510, y: 150 }, data: { name: 'AI Screening rubric', type: 'OpenAINode', config: { systemPrompt: 'Evaluate candidate credentials.', prompt: 'Evaluate candidate text: {{hr_2.result}}' } } },
      { id: 'hr_4', type: 'GmailNode', position: { x: 740, y: 150 }, data: { name: 'Email Candidate', type: 'GmailNode', config: { to: '{{trigger.email}}', subject: 'Onboarding Update', body: 'Dear applicant, we reviewed your profile.' } } }
    ],
    edges: [
      { id: 'h_e_1', source: 'hr_1', target: 'hr_2', markerEnd: { type: 'arrowclosed' } },
      { id: 'h_e_2', source: 'hr_2', target: 'hr_3', markerEnd: { type: 'arrowclosed' } },
      { id: 'h_e_3', source: 'hr_3', target: 'hr_4', markerEnd: { type: 'arrowclosed' } }
    ]
  },
  {
    id: 'tpl-sla-monitor',
    name: 'Support Tickets SLA Escalation',
    description: 'Watches for incoming complaints and support requests. Escalates priority status automatically if ticket remains unassigned past SLA thresholds.',
    category: 'Customer Service',
    nodes: [
      { id: 't_1', type: 'HubSpotTrigger', position: { x: 50, y: 150 }, data: { name: 'Ticket Created', type: 'HubSpotTrigger', config: { triggerType: 'Ticket Created' } } },
      { id: 't_2', type: 'ConditionNode', position: { x: 300, y: 150 }, data: { name: 'Is Urgent Priority?', type: 'ConditionNode', config: { field: '{{t_1.priority}}', operator: 'equals', value: 'Urgent' } } },
      { id: 't_3', type: 'SMSNode', position: { x: 550, y: 80 }, data: { name: 'SMS Supervisor', type: 'SMSNode', config: { phone: '555-0199', message: 'Urgent ticket SLA risk warning!' } } },
      { id: 't_4', type: 'SlackNode', position: { x: 550, y: 240 }, data: { name: 'Notify Channel', type: 'SlackNode', config: { channel: '#cleaning-ops', body: 'Standard ticket recorded.' } } }
    ],
    edges: [
      { id: 't_e_1', source: 't_1', target: 't_2', markerEnd: { type: 'arrowclosed' } },
      { id: 't_e_2', source: 't_2', target: 't_3', sourceHandle: 'true', markerEnd: { type: 'arrowclosed' } },
      { id: 't_e_3', source: 't_2', target: 't_4', sourceHandle: 'false', markerEnd: { type: 'arrowclosed' } }
    ]
  }
];

const WorkflowMarketplace = () => {
  const navigate = useNavigate();
  const { accessToken } = useSelector(state => state.auth);

  const installTemplate = async (template) => {
    try {
      const res = await axios.post('/api/workflows', {
        name: `[Template] ${template.name}`,
        description: template.description,
        nodes: template.nodes,
        edges: template.edges
      }, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      
      // Redirect straight to visual canvas
      navigate(`/workflow/builder/${res.data._id}`);
    } catch (err) {
      console.error('Failed to install template:', err);
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
        <ShopIcon color="primary" />
        <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#517891' }}>Workflow Automation Marketplace</Typography>
      </Box>

      <Grid container spacing={2}>
        {templates.map((tpl) => (
          <Grid item xs={12} sm={6} key={tpl.id}>
            <Card sx={{ border: '1px solid #E5E7EB', display: 'flex', flexDirection: 'column', height: '100%' }}>
              <CardContent sx={{ flexGrow: 1, p: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#517891' }}>
                    {tpl.name}
                  </Typography>
                  <Chip label={tpl.category} size="small" color="secondary" sx={{ backgroundColor: '#57B9FF', color: '#fff', fontSize: '10px' }} />
                </Box>
                <Typography variant="body2" color="textSecondary" sx={{ fontSize: '13px', lineHeight: 1.3, mb: 2 }}>
                  {tpl.description}
                </Typography>
                
                <Box sx={{ background: '#F8FAFC', p: 1, borderRadius: '4px', border: '1px dashed #D1D5DB' }}>
                  <Typography variant="caption" sx={{ fontWeight: 'bold', display: 'block', mb: 0.5, color: '#4B5563' }}>Included Nodes:</Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {tpl.nodes.map((node) => (
                      <Chip key={node.id} label={node.data.name} size="small" variant="outlined" sx={{ fontSize: '9px', height: '20px' }} />
                    ))}
                  </Box>
                </Box>
              </CardContent>
              <CardActions sx={{ borderTop: '1px solid #E5E7EB', p: 1, justifyContent: 'flex-end' }}>
                <Button
                  size="small"
                  variant="contained"
                  color="secondary"
                  onClick={() => installTemplate(tpl)}
                  sx={{ backgroundColor: '#57B9FF' }}
                  startIcon={<CheckCircleIcon sx={{ fontSize: 14 }} />}
                >
                  One-Click Install
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default WorkflowMarketplace;
