import React from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Divider,
  Card,
  CardContent,
  Chip
} from '@mui/material';
import MemoryIcon from '@mui/icons-material/Memory';
import ContactMailIcon from '@mui/icons-material/ContactMail';
import ShareIcon from '@mui/icons-material/Share';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import SettingsSuggestIcon from '@mui/icons-material/SettingsSuggest';
import AlternateEmailIcon from '@mui/icons-material/AlternateEmail';

const NodeLibrary = () => {
  const nodeCategories = [
    {
      category: 'CRM & HubSpot Nodes',
      description: 'Interact with CRM Leads, Deals, Companies, and webhook synchronizations.',
      color: '#845EC2',
      nodes: [
        { name: 'HubSpot Deal Event Trigger', type: 'Trigger', in: 'None', out: 'Deal ID, Value, Stage' },
        { name: 'HubSpot Contact Sync', type: 'Action', in: 'Email, First Name, Last Name', out: 'Contact ID' },
        { name: 'CRM Round-Robin Lead Reassignment', type: 'Automation', in: 'Lead ID', out: 'Assigned User ID' },
        { name: 'Lead Hygiene Verification', type: 'Logic', in: 'Lead Details', out: 'Status Flag (Active/Inactive)' }
      ]
    },
    {
      category: 'AI & LLM Nodes',
      description: 'Generative prompt completions, memory logging, and vector searches.',
      color: '#00C9A7',
      nodes: [
        { name: 'OpenAI Prompt Completion', type: 'Action', in: 'Prompt Text, Temperature', out: 'LLM Result Text' },
        { name: 'Claude Structured Parser', type: 'Action', in: 'Raw Text, JSON Schema', out: 'Parsed Object' },
        { name: 'SOP RAG Vector Lookup', type: 'Database', in: 'Query String', out: 'Relevant Text Chunk Context' },
        { name: 'AI Decision Gate', type: 'Condition', in: 'Input Text', out: 'Yes / No Branch' }
      ]
    },
    {
      category: 'Email & Notification Nodes',
      description: 'Send alerts, notifications, and dynamic SMTP/Resend delivery logs.',
      color: '#F3C5FF',
      nodes: [
        { name: 'SMTP Direct Mail Dispatch', type: 'Action', in: 'To, Subject, Body', out: 'Message ID' },
        { name: 'Resend Domain Transactional Sender', type: 'Action', in: 'Template Name, Variables', out: 'Delivery Status' },
        { name: 'Socket.IO User Presence Alert', type: 'Broadcast', in: 'User ID, Alert Message', out: 'None' }
      ]
    },
    {
      category: 'Database & Monitoring Nodes',
      description: 'Perform CRUD actions on Mongo or Supabase instances, and audits.',
      color: '#845EC2',
      nodes: [
        { name: 'MongoDB Save Record', type: 'Database', in: 'Model Name, Document Schema', out: 'Saved ID' },
        { name: 'Supabase Postgres Realtime Stream', type: 'Trigger', in: 'Table Filter', out: 'Row State Delta' },
        { name: 'System Performance Audit Logger', type: 'Audit', in: 'Action Event Details', out: 'Audit Log ID' }
      ]
    }
  ];

  return (
    <Box sx={{ p: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
      {/* Header */}
      <Box sx={{ borderBottom: '1px solid #845EC2', pb: 1 }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
          WORKFLOW NODE TYPE REGISTRY LIBRARY
        </Typography>
        <Typography variant="caption" color="textSecondary">
          Central schema catalog of allowed CRM filters, LLM parameters, database connectors, and email broadcast triggers
        </Typography>
      </Box>

      {/* Main Categories */}
      <Grid container spacing={2}>
        {nodeCategories.map((cat, idx) => (
          <Grid item xs={12} md={6} key={idx}>
            <Paper sx={{ p: 2, height: '100%' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#845EC2' }}>
                  {cat.category}
                </Typography>
                <Chip label="Qualified" color="success" size="small" sx={{ backgroundColor: '#00C9A7' }} />
              </Box>
              <Typography variant="caption" color="textSecondary" display="block" sx={{ mb: 2 }}>
                {cat.description}
              </Typography>

              <Divider sx={{ mb: 2 }} />

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {cat.nodes.map((node, nIdx) => (
                  <Card key={nIdx} sx={{ border: '1px solid #F3C5FF', p: '2px', boxShadow: 'none' }}>
                    <CardContent sx={{ p: 1, '&:last-child': { pb: 1 } }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#1E293B' }}>
                          {node.name}
                        </Typography>
                        <Chip label={node.type} size="small" sx={{ fontSize: '10px', height: 18, backgroundColor: '#F3C5FF' }} />
                      </Box>
                      <Grid container spacing={1} sx={{ fontSize: '11px', backgroundColor: '#FEFEDF', p: 0.5, borderRadius: '4px' }}>
                        <Grid item xs={6}>
                          <span style={{ color: '#64748B' }}>Inputs: </span>
                          <strong>{node.in}</strong>
                        </Grid>
                        <Grid item xs={6}>
                          <span style={{ color: '#64748B' }}>Outputs: </span>
                          <strong>{node.out}</strong>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default NodeLibrary;
