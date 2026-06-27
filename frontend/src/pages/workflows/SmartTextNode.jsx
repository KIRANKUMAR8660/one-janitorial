import React, { useState, useEffect, useRef } from 'react';
import { Handle, Position } from 'reactflow';
import { Box, Typography } from '@mui/material';

const SmartTextNode = ({ id, data }) => {
  const [text, setText] = useState(data.value || '');
  const [variables, setVariables] = useState([]);
  const textareaRef = useRef(null);

  // Parse variables using regex (valid JS variable names inside {{}})
  useEffect(() => {
    const regex = /\{\{([a-zA-Z_$][a-zA-Z0-9_$]*)\}\}/g;
    const foundVars = [];
    let match;
    while ((match = regex.exec(text)) !== null) {
      const varName = match[1];
      if (!foundVars.includes(varName)) {
        foundVars.push(varName);
      }
    }
    setVariables(foundVars);
    
    // Propagate parsed variables to parent flow state
    if (data.onVariablesChange) {
      data.onVariablesChange(id, foundVars);
    }
  }, [text, id]);

  // Handle auto-resizing height and width
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, [text]);

  const handleChange = (e) => {
    const val = e.target.value;
    setText(val);
    if (data.onChange) {
      data.onChange(id, val);
    }
  };

  // Node status border color class helper
  const getStatusClass = () => {
    if (!data.status) return '';
    return `status-${data.status.toLowerCase()}`;
  };

  // Calculate width based on longest line of text
  const getWidth = () => {
    const lines = text.split('\n');
    const longestLine = lines.reduce((max, line) => Math.max(max, line.length), 0);
    return Math.max(240, Math.min(480, longestLine * 8 + 40));
  };

  return (
    <div className={`smart-text-node-container ${getStatusClass()}`} style={{ width: getWidth() }}>
      {/* Input Handles on the left side based on variables */}
      {variables.map((varName, idx) => {
        const topPercentage = `${((idx + 1) * 100) / (variables.length + 1)}%`;
        return (
          <div key={varName} style={{ position: 'absolute', left: '-12px', top: topPercentage, display: 'flex', alignItems: 'center' }}>
            <Handle
              type="target"
              position={Position.Left}
              id={varName}
              className="custom-flow-handle left"
            />
            <Typography 
              variant="caption" 
              sx={{ 
                fontSize: '8px', 
                background: '#517891', 
                color: '#ffffff', 
                px: 0.5, 
                py: 0.25, 
                borderRadius: '2px',
                marginLeft: '8px',
                pointerEvents: 'none'
              }}
            >
              {varName}
            </Typography>
          </div>
        );
      })}

      {/* Header */}
      <div className="workflow-node-header trigger" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '24px' }}>
        <span>Smart Text Template</span>
        {data.status && (
          <span style={{ fontSize: '8px', padding: '1px 3px', border: '1px solid #fff', borderRadius: '2px' }}>
            {data.status}
          </span>
        )}
      </div>

      {/* Body Area */}
      <Box className="workflow-node-body" sx={{ mt: 0.5 }}>
        <textarea
          ref={textareaRef}
          value={text}
          onChange={handleChange}
          placeholder="Hello {{employeeName}}, your ticket {{ticketId}} is active..."
          className="smart-text-node-textarea"
          rows={2}
        />
      </Box>

      {/* Standard Output handle on the right */}
      <Handle
        type="source"
        position={Position.Right}
        id="output"
        className="custom-flow-handle right"
      />
      
      <div className="workflow-node-footer">
        {variables.length > 0 ? `${variables.length} variable(s) detected` : 'No variables'}
      </div>
    </div>
  );
};

export default SmartTextNode;
