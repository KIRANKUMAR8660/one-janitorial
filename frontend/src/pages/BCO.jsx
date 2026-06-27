import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, Grid, Card, CardContent, Chip, TextField } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { fetchBcoProjects } from '../store/index.js';
import EnterpriseTable from '../components/EnterpriseTable.jsx';
import axios from 'axios';

const BCO = () => {
  const dispatch = useDispatch();
  const { bcoProjects } = useSelector(state => state.app);

  const [allianceName, setAllianceName] = useState('');
  const [buildingName, setBuildingName] = useState('');
  const [contractValue, setContractValue] = useState('');
  const [partnerPercentage, setPartnerPercentage] = useState(50);

  useEffect(() => {
    dispatch(fetchBcoProjects());
  }, [dispatch]);

  const handleCreate = async () => {
    if (!allianceName || !buildingName || !contractValue) return;

    try {
      const staffPercentage = 100 - partnerPercentage;
      const calculatedAmount = (Number(contractValue) * partnerPercentage) / 100;

      await axios.post('/api/bco/projects', {
        allianceName,
        buildingName,
        contractValue: Number(contractValue),
        profitSplits: [{
          partnerName: 'Alliance Joint Partner',
          partnerPercentage,
          staffPercentage,
          calculatedAmount
        }]
      });

      setAllianceName('');
      setBuildingName('');
      setContractValue('');
      dispatch(fetchBcoProjects());
      alert('BCO Contract logged and welcome email automation triggered.');
    } catch (err) {
      alert(err.response?.data?.message || 'Error creating project');
    }
  };

  const columns = [
    {
      id: 'allianceName',
      label: 'Alliance / Building',
      sortable: true,
      render: (row) => (
        <Box>
          <Typography sx={{ fontWeight: 600, fontSize: '0.85rem' }}>{row.allianceName}</Typography>
          <Typography variant="caption" sx={{ color: '#6B7280' }}>{row.buildingName}</Typography>
        </Box>
      )
    },
    { id: 'contractValue', label: 'Value', sortable: true, render: (row) => `$${row.contractValue}` },
    { 
      id: 'partnerPercentage', 
      label: 'Partner Split', 
      render: (row) => `${row.profitSplits?.[0]?.partnerPercentage || 0}%` 
    },
    { 
      id: 'calculatedAmount', 
      label: 'Partner Share', 
      render: (row) => `$${row.profitSplits?.[0]?.calculatedAmount || 0}` 
    },
    { 
      id: 'welcomeEmailSent', 
      label: 'Welcome Email', 
      sortable: true,
      render: (row) => {
        const text = row.welcomeEmailSent ? 'SENT' : 'PENDING';
        return <Chip label={text} color={row.welcomeEmailSent ? 'success' : 'secondary'} size="small" sx={{ borderRadius: '4px', fontSize: '0.7rem' }} />;
      }
    },
    {
      id: 'contractFilingPath',
      label: 'Contract File',
      render: (row) => (
        <Typography sx={{ fontSize: '0.75rem', color: '#57B9FF', textDecoration: 'underline', fontWeight: 600, cursor: 'pointer' }}>
          {row.contractFilingPath ? 'filed_signed_doc.pdf' : 'Missing'}
        </Typography>
      )
    }
  ];

  return (
    <Box sx={{ p: '2px' }}>
      <Box sx={{ borderBottom: '1px solid #E5E7EB', pb: 1, mb: 2 }}>
        <Typography sx={{ fontSize: '32px', fontWeight: 600, color: '#517891', lineHeight: 1.2 }}>
          BCO ALLIANCE & OPERATIONS REGISTER
        </Typography>
        <Typography sx={{ fontSize: '12px', color: '#4B5563', mt: 0.5 }}>
          Calculate alliance profit splits, file building contracts, and schedule service inspections
        </Typography>
      </Box>

      <Grid container spacing={1.5}>
        {/* Project Lists and Split calculations */}
        <Grid item xs={12} md={8}>
          <Card sx={{ p: '2px' }}>
            <CardContent sx={{ p: '12px !important' }}>
              <Typography sx={{ fontSize: '16px', fontWeight: 600, color: '#517891', mb: 1 }}>
                CONTRACT TRACKING & PROFIT SPLIT CALCULATIONS
              </Typography>
              <EnterpriseTable
                data={bcoProjects}
                columns={columns}
                searchPlaceholder="Search alliance name or building..."
                exportFilename="bco_contracts"
                rowKey="_id"
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Right Panel: Log Contract & Split Calculator */}
        <Grid item xs={12} md={4}>
          <Card sx={{ border: '1px solid #E5E7EB', borderRadius: '4px', mb: 2, p: '2px' }}>
            <CardContent sx={{ p: '12px !important' }}>
              <Typography sx={{ fontSize: '16px', fontWeight: 600, color: '#517891', mb: 1.5 }}>
                LOG CONTRACT & CALCULATOR
              </Typography>
              <TextField
                label="Alliance Partner Name"
                fullWidth
                size="small"
                margin="dense"
                value={allianceName}
                onChange={(e) => setAllianceName(e.target.value)}
              />
              <TextField
                label="Building / Site"
                fullWidth
                size="small"
                margin="dense"
                value={buildingName}
                onChange={(e) => setBuildingName(e.target.value)}
              />
              <TextField
                label="Contract Value ($)"
                type="number"
                fullWidth
                size="small"
                margin="dense"
                value={contractValue}
                onChange={(e) => setContractValue(e.target.value)}
              />
              <TextField
                label="Partner Percentage Split (%)"
                type="number"
                fullWidth
                size="small"
                margin="dense"
                value={partnerPercentage}
                onChange={(e) => setPartnerPercentage(e.target.value)}
              />
              
              <Box sx={{ mt: 1.5, p: 1.5, backgroundColor: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: '4px' }}>
                <Typography sx={{ fontSize: '12px', display: 'block', color: '#111827', fontWeight: 600 }}>
                  Partner Share: ${((Number(contractValue) || 0) * (partnerPercentage || 0)) / 100}
                </Typography>
                <Typography sx={{ fontSize: '12px', display: 'block', color: '#4B5563', mt: 0.5 }}>
                  Staff Share: ${((Number(contractValue) || 0) * (100 - (partnerPercentage || 0))) / 100}
                </Typography>
              </Box>

              <Button 
                variant="contained" 
                color="primary"
                fullWidth 
                sx={{ mt: 2, height: 36, borderRadius: '4px' }}
                onClick={handleCreate}
              >
                Log Contract
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default BCO;
