import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, Grid, Card, CardContent, Chip, TextField, Divider } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { fetchJobPostings } from '../store/index.js';
import axios from 'axios';
import EnterpriseTable from '../components/EnterpriseTable.jsx';

const HR = () => {
  const dispatch = useDispatch();
  const { jobPostings } = useSelector(state => state.app);

  const [selectedJob, setSelectedJob] = useState(null);
  const [jobTitle, setJobTitle] = useState('');
  const [department, setDepartment] = useState('');

  // Applicant fields
  const [appName, setAppName] = useState('');
  const [appEmail, setAppEmail] = useState('');
  const [resumeText, setResumeText] = useState('');

  useEffect(() => {
    dispatch(fetchJobPostings());
  }, [dispatch]);

  // Keep selected job updated when jobPostings refresh
  useEffect(() => {
    if (selectedJob && jobPostings.length > 0) {
      const updated = jobPostings.find(j => j._id === selectedJob._id);
      if (updated) {
        setSelectedJob(updated);
      }
    }
  }, [jobPostings]);

  const handleCreateJob = async () => {
    if (!jobTitle) return;
    try {
      await axios.post('/api/hr/postings', { title: jobTitle, department });
      setJobTitle('');
      setDepartment('');
      dispatch(fetchJobPostings());
    } catch (err) {
      alert(err.response?.data?.message || 'Error creating job');
    }
  };

  const handleAddApplicant = async () => {
    if (!selectedJob || !appName || !appEmail) return;
    try {
      await axios.post(`/api/hr/postings/${selectedJob._id}/applicants`, {
        fullName: appName,
        email: appEmail,
        resumeText
      });
      setAppName('');
      setAppEmail('');
      setResumeText('');
      
      dispatch(fetchJobPostings());
      alert('Candidate logged. AI resume evaluation complete and ranking updated.');
    } catch (err) {
      alert(err.response?.data?.message || 'Error adding applicant');
    }
  };

  // Vacancy Table configuration
  const deptOptions = Array.from(new Set(jobPostings.map(j => j.department).filter(Boolean)));
  const vacanciesColumns = [
    { id: 'title', label: 'Job Title', sortable: true },
    { 
      id: 'department', 
      label: 'Department', 
      sortable: true,
      filterType: 'select',
      filterOptions: deptOptions
    },
    { 
      id: 'status', 
      label: 'Status', 
      sortable: true, 
      render: (row) => (
        <Chip 
          label={row.status} 
          size="small" 
          color={row.status === 'Open' ? 'success' : 'default'} 
          sx={{ borderRadius: '4px', height: '20px', fontSize: '11px' }} 
        />
      )
    },
    { 
      id: 'applicantsCount', 
      label: 'Applicants', 
      sortable: true,
      render: (row) => `${row.applicants?.length || 0} candidates`
    }
  ];

  // Candidates Table configuration
  const candidatesColumns = [
    { id: 'fullName', label: 'Full Name', sortable: true },
    { id: 'email', label: 'Email', sortable: true },
    { 
      id: 'appliedDate', 
      label: 'Applied', 
      sortable: true,
      render: (row) => new Date(row.appliedDate).toLocaleDateString()
    },
    { 
      id: 'rankingScore', 
      label: 'Rank Score', 
      sortable: true,
      render: (row) => (
        <Typography variant="body2" sx={{ fontWeight: 700, color: row.rankingScore >= 70 ? '#10B981' : '#EAB308' }}>
          {row.rankingScore || 0}/100
        </Typography>
      )
    },
    { 
      id: 'status', 
      label: 'Status', 
      sortable: true,
      render: (row) => (
        <Chip 
          label={row.status} 
          size="small" 
          sx={{ 
            borderRadius: '4px', 
            height: '20px', 
            fontSize: '11px', 
            bgcolor: 'rgba(0, 168, 232, 0.08)', 
            color: '#517891' 
          }} 
        />
      )
    },
    {
      id: 'aiScreeningNotes',
      label: 'AI Screening Notes',
      sortable: false,
      render: (row) => {
        return row.aiScreeningQuestions?.map(q => q.analysis).filter(Boolean).join('; ') || 'No AI feedback';
      }
    }
  ];

  return (
    <Box sx={{ p: 1 }}>
      <Box sx={{ borderBottom: '1px solid #E5E7EB', pb: 1.5, mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, color: '#517891' }}>
          HR RECRUITMENT & CANDIDATE RANKINGS
        </Typography>
        <Typography variant="caption" sx={{ color: '#6B7280' }}>
          Track job postings, applicants, schedule reference checks, and view AI resume screening ranks
        </Typography>
      </Box>

      <Grid container spacing={1.5}>
        {/* Left Side: Job Postings */}
        <Grid item xs={12} md={selectedJob ? 7 : 12}>
          <Card sx={{ mb: 1.5 }}>
            <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#517891', mb: 1 }}>
                ACTIVE STAFF VACANCIES
              </Typography>
              <EnterpriseTable
                data={jobPostings}
                columns={vacanciesColumns}
                searchPlaceholder="Search vacancies..."
                exportFilename="vacancies_export"
                onRowClick={(row) => setSelectedJob(row)}
                rowKey="_id"
              />
            </CardContent>
          </Card>

          {/* Add Job Posting Form */}
          <Card>
            <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#517891', mb: 1 }}>
                ADD JOB POSTING
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <TextField
                  label="Vacancy Title"
                  size="small"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  sx={{ minWidth: '200px' }}
                />
                <TextField
                  label="Department"
                  size="small"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  sx={{ minWidth: '200px' }}
                />
                <Button 
                  variant="contained" 
                  onClick={handleCreateJob}
                  sx={{ height: '36px' }}
                >
                  Create Posting
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Right Side: Candidate screening dashboard */}
        {selectedJob && (
          <Grid item xs={12} md={5}>
            <Card sx={{ border: '1px solid #517891' }}>
              <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#517891' }}>
                    APPLICANTS: {selectedJob.title.toUpperCase()}
                  </Typography>
                  <Button size="small" variant="text" color="error" onClick={() => setSelectedJob(null)}>
                    Close
                  </Button>
                </Box>
                
                <Divider sx={{ my: 1 }} />

                {/* Candidate list */}
                <Box sx={{ my: 1.5 }}>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#517891', mb: 1, display: 'block' }}>
                    RANKED CANDIDATES (AI EVALUATION)
                  </Typography>
                  <EnterpriseTable
                    data={selectedJob.applicants || []}
                    columns={candidatesColumns}
                    searchPlaceholder="Search candidates..."
                    exportFilename={`applicants_${selectedJob.title}`}
                    rowKey="_id"
                  />
                </Box>
                
                <Divider sx={{ my: 1.5 }} />

                {/* Log candidate application */}
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#517891', mb: 1 }}>
                  ADD CANDIDATE & RUN AI SCREENING
                </Typography>
                <TextField
                  label="Candidate Name"
                  fullWidth
                  size="small"
                  margin="dense"
                  value={appName}
                  onChange={(e) => setAppName(e.target.value)}
                />
                <TextField
                  label="Email"
                  fullWidth
                  size="small"
                  margin="dense"
                  value={appEmail}
                  onChange={(e) => setAppEmail(e.target.value)}
                />
                <TextField
                  label="Resume Text / Summary"
                  fullWidth
                  size="small"
                  margin="dense"
                  multiline
                  rows={3}
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                />
                <Button 
                  variant="contained" 
                  fullWidth 
                  onClick={handleAddApplicant}
                  sx={{ mt: 1.5, height: '36px' }}
                >
                  Analyze & Rank Resume
                </Button>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default HR;
