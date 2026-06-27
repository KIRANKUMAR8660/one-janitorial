import React, { useEffect } from 'react';
import { Box, Typography, Select, MenuItem } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { fetchEmployees } from '../store/index.js';
import EnterpriseTable from '../components/EnterpriseTable.jsx';
import axios from 'axios';

const Employees = () => {
  const dispatch = useDispatch();
  const { employees } = useSelector(state => state.app);

  useEffect(() => {
    dispatch(fetchEmployees());
  }, [dispatch]);

  const handleUpdateStatus = async (id, status) => {
    try {
      await axios.put(`/api/employees/${id}`, { status });
      dispatch(fetchEmployees());
      alert('Employee status updated successfully.');
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating status');
    }
  };

  const handleBulkStatusUpdate = async (ids, status) => {
    try {
      // Execute serial or batch update requests
      await Promise.all(ids.map(id => axios.put(`/api/employees/${id}`, { status })));
      dispatch(fetchEmployees());
      alert(`Successfully updated status to ${status} for ${ids.length} staff members.`);
    } catch (err) {
      alert('Error executing bulk status update: ' + err.message);
    }
  };

  // Define columns for EnterpriseTable
  const columns = [
    { 
      id: 'firstName', 
      label: 'Staff Member', 
      sortable: true,
      render: (row) => (
        <Box>
          <Typography sx={{ fontWeight: 600, fontSize: '0.85rem' }}>
            {row.firstName} {row.lastName}
          </Typography>
          <Typography variant="caption" sx={{ color: '#6B7280', display: 'block' }}>
            {row.user?.email}
          </Typography>
        </Box>
      )
    },
    { 
      id: 'department', 
      label: 'Department', 
      sortable: true,
      filterType: 'select',
      filterOptions: ['Administration', 'Sales', 'BCO Operations', 'Client Service', 'HR', 'Operations', 'Field Staff']
    },
    { 
      id: 'role', 
      label: 'System Role', 
      sortable: true,
      render: (row) => row.user?.role || 'Employee'
    },
    { 
      id: 'manager', 
      label: 'Direct Manager', 
      render: (row) => row.manager ? `${row.manager.firstName} ${row.manager.lastName}` : 'Direct Administration'
    },
    { 
      id: 'status', 
      label: 'Operational Status', 
      sortable: true,
      filterType: 'select',
      filterOptions: ['Active', 'On Leave', 'Suspended', 'Terminated', 'Onboarding'],
      render: (row) => (
        <Select
          size="small"
          value={row.status}
          onChange={(e) => handleUpdateStatus(row._id, e.target.value)}
          sx={{ fontSize: '0.75rem', height: 26, borderRadius: '4px', minWidth: 110 }}
        >
          {['Active', 'On Leave', 'Suspended', 'Terminated', 'Onboarding'].map(st => (
            <MenuItem key={st} value={st} sx={{ fontSize: '0.75rem' }}>{st}</MenuItem>
          ))}
        </Select>
      )
    }
  ];

  // Define bulk actions
  const bulkActions = [
    { label: 'Set Active', action: (ids) => handleBulkStatusUpdate(ids, 'Active') },
    { label: 'Set On Leave', action: (ids) => handleBulkStatusUpdate(ids, 'On Leave') },
    { label: 'Set Suspended', action: (ids) => handleBulkStatusUpdate(ids, 'Suspended') }
  ];

  return (
    <Box sx={{ p: '2px' }}>
      {/* Header */}
      <Box sx={{ borderBottom: '1px solid #E5E7EB', pb: 1, mb: 2 }}>
        <Typography sx={{ fontSize: '32px', fontWeight: 600, color: '#517891', lineHeight: 1.2 }}>
          EMPLOYEE DIRECTORY & HIERARCHY
        </Typography>
        <Typography sx={{ fontSize: '12px', color: '#4B5563', mt: 0.5 }}>
          Organize department assignments, direct manager relationships, and verify active staff status
        </Typography>
      </Box>

      {/* Enterprise Data Table */}
      <EnterpriseTable
        data={employees}
        columns={columns}
        searchPlaceholder="Search staff member, email, or role..."
        bulkActions={bulkActions}
        exportFilename="employees_directory"
        rowKey="_id"
      />
    </Box>
  );
};

export default Employees;
