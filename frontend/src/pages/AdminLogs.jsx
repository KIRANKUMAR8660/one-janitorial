import React, { useEffect } from 'react';
import { Box, Typography, Card, CardContent } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAuditLogs } from '../store/index.js';
import EnterpriseTable from '../components/EnterpriseTable.jsx';

const AdminLogs = () => {
  const dispatch = useDispatch();
  const { auditLogs } = useSelector(state => state.app);

  useEffect(() => {
    dispatch(fetchAuditLogs());
  }, [dispatch]);

  const auditColumns = [
    { 
      id: 'createdAt', 
      label: 'Timestamp', 
      sortable: true,
      render: (row) => new Date(row.createdAt).toLocaleString() 
    },
    { 
      id: 'userEmail', 
      label: 'User Email', 
      sortable: true, 
      render: (row) => row.user?.email || 'SYSTEM' 
    },
    { 
      id: 'action', 
      label: 'Action Flag', 
      sortable: true,
      render: (row) => (
        <Typography variant="body2" sx={{ fontWeight: 700, color: '#517891' }}>
          {row.action}
        </Typography>
      )
    },
    { id: 'module', label: 'Module', sortable: true },
    { 
      id: 'details', 
      label: 'Ip Address / Context Details', 
      sortable: false,
      render: (row) => (
        <Typography variant="caption" sx={{ color: '#4B5563' }}>
          IP: {row.ipAddress || '127.0.0.1'} | {row.details}
        </Typography>
      )
    }
  ];

  return (
    <Box sx={{ p: 1 }}>
      <Box sx={{ borderBottom: '1px solid #E5E7EB', pb: 1.5, mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, color: '#517891' }}>
          SYSTEM SECURITY AUDIT LOGS
        </Typography>
        <Typography variant="caption" sx={{ color: '#6B7280' }}>
          Access logs, RBAC enforcement tracking, and record modifications history
        </Typography>
      </Box>

      <Card>
        <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#517891', mb: 1 }}>
            ADMINISTRATIVE TRACE JOURNAL
          </Typography>
          <EnterpriseTable
            data={auditLogs}
            columns={auditColumns}
            searchPlaceholder="Search audit logs..."
            exportFilename="system_audit_logs"
            rowKey="_id"
          />
        </CardContent>
      </Card>
    </Box>
  );
};

export default AdminLogs;
