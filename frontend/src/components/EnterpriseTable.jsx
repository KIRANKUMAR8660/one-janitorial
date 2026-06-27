import React, { useState, useMemo } from 'react';
import { 
  Box, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper, 
  Checkbox, 
  TablePagination, 
  TextField, 
  InputAdornment, 
  Button, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  IconButton, 
  Typography,
  Toolbar,
  Menu,
  FormControlLabel,
  Divider
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ViewColumnIcon from '@mui/icons-material/ViewColumn';

const EnterpriseTable = ({
  data = [],
  columns = [],
  searchPlaceholder = 'Search records...',
  onRowClick = null,
  bulkActions = [],
  exportFilename = 'export_data',
  rowKey = '_id'
}) => {
  // States
  const [searchQuery, setSearchQuery] = useState('');
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');
  const [currentPage, setCurrentPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [filters, setFilters] = useState({}); // columnId -> selectedValue

  // Column Visibility States
  const [visibleColumnIds, setVisibleColumnIds] = useState(
    new Set(columns.map(c => c.id))
  );
  const [columnMenuAnchor, setColumnMenuAnchor] = useState(null);

  // Filter columns to render only visible ones
  const activeColumns = useMemo(() => {
    return columns.filter(c => visibleColumnIds.has(c.id));
  }, [columns, visibleColumnIds]);

  const handleToggleColumn = (colId) => {
    const nextVisible = new Set(visibleColumnIds);
    if (nextVisible.has(colId)) {
      // Prevent hiding all columns
      if (nextVisible.size > 1) {
        nextVisible.delete(colId);
      }
    } else {
      nextVisible.add(colId);
    }
    setVisibleColumnIds(nextVisible);
  };

  // Helper to trigger download of CSV
  const handleExportCSV = () => {
    if (data.length === 0) return;
    
    // Headers list
    const headers = activeColumns.map(c => c.label);
    
    // Rows list
    const csvRows = [headers.join(',')];
    
    data.forEach(row => {
      const values = activeColumns.map(c => {
        let val = '';
        if (c.render) {
          const renderedVal = c.render(row);
          val = typeof renderedVal === 'string' ? renderedVal : (row[c.id] || '');
        } else {
          val = row[c.id] || '';
        }
        // Escape quotes
        const escaped = ('' + val).replace(/"/g, '""');
        return `"${escaped}"`;
      });
      csvRows.push(values.join(','));
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + csvRows.join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${exportFilename}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Checkbox interactions
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const newSelected = new Set(processedRows.map(row => row[rowKey]));
      setSelectedIds(newSelected);
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectRow = (e, id) => {
    e.stopPropagation();
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  // Sort handler
  const handleSort = (columnId) => {
    if (sortColumn === columnId) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(columnId);
      setSortDirection('asc');
    }
  };

  // Filter change handler
  const handleFilterChange = (columnId, value) => {
    setFilters({
      ...filters,
      [columnId]: value
    });
    setCurrentPage(0);
  };

  // Process rows: Filter + Search + Sort + Paginate
  const processedRows = useMemo(() => {
    let result = [...data];

    // 1. Text Search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(row => {
        return activeColumns.some(col => {
          let val = '';
          if (col.render) {
            const rendered = col.render(row);
            val = typeof rendered === 'string' ? rendered : '';
          } else {
            val = row[col.id] || '';
          }
          return String(val).toLowerCase().includes(query);
        });
      });
    }

    // 2. Dropdown Filters
    Object.keys(filters).forEach(colId => {
      const filterVal = filters[colId];
      if (filterVal && filterVal !== 'ALL') {
        result = result.filter(row => String(row[colId]) === filterVal);
      }
    });

    // 3. Sorting
    if (sortColumn) {
      const colDef = activeColumns.find(c => c.id === sortColumn);
      result.sort((a, b) => {
        let valA = a[sortColumn];
        let valB = b[sortColumn];
        if (colDef && colDef.render) {
          const renderedA = colDef.render(a);
          const renderedB = colDef.render(b);
          valA = typeof renderedA === 'string' ? renderedA : valA;
          valB = typeof renderedB === 'string' ? renderedB : valB;
        }

        if (valA === undefined || valA === null) valA = '';
        if (valB === undefined || valB === null) valB = '';

        if (typeof valA === 'string') {
          return sortDirection === 'asc' 
            ? valA.localeCompare(valB) 
            : valB.localeCompare(valA);
        } else {
          return sortDirection === 'asc' 
            ? valA - valB 
            : valB - valA;
        }
      });
    }

    return result;
  }, [data, activeColumns, searchQuery, filters, sortColumn, sortDirection]);

  // Paginated Slice
  const paginatedRows = useMemo(() => {
    const start = currentPage * rowsPerPage;
    return processedRows.slice(start, start + rowsPerPage);
  }, [processedRows, currentPage, rowsPerPage]);

  return (
    <Box sx={{ width: '100%' }}>
      {/* 1. Header Toolbar: Search, Filters, Export, Column Visibility */}
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: 'center', gap: 1, mb: 1, mt: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: { xs: '100%', sm: 'auto' }, flexWrap: 'wrap' }}>
          <TextField
            size="small"
            placeholder={searchPlaceholder}
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(0); }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" sx={{ color: '#64748B' }} />
                </InputAdornment>
              ),
              style: { height: 32, fontSize: '0.85rem' }
            }}
            sx={{ width: { xs: '100%', sm: 240 } }}
          />

          {/* Render Filters */}
          {columns.filter(c => c.filterType === 'select').map(col => (
            <FormControl key={col.id} size="small" sx={{ minWidth: 120 }}>
              <Select
                value={filters[col.id] || 'ALL'}
                onChange={(e) => handleFilterChange(col.id, e.target.value)}
                sx={{ height: 32, fontSize: '0.8rem' }}
              >
                <MenuItem value="ALL">All {col.label}s</MenuItem>
                {col.filterOptions.map(opt => (
                  <MenuItem key={opt} value={opt} sx={{ fontSize: '0.8rem' }}>{opt}</MenuItem>
                ))}
              </Select>
            </FormControl>
          ))}
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {/* Column Visibility Selector Toggle */}
          <Button
            size="small"
            variant="outlined"
            onClick={(e) => setColumnMenuAnchor(e.currentTarget)}
            startIcon={<ViewColumnIcon fontSize="small" />}
            sx={{ height: 32, borderColor: '#77B1D4', color: '#517891', '&:hover': { borderColor: '#57B9FF' } }}
          >
            Columns
          </Button>
          <Menu
            anchorEl={columnMenuAnchor}
            open={Boolean(columnMenuAnchor)}
            onClose={() => setColumnMenuAnchor(null)}
            PaperProps={{ sx: { p: 1, maxHeight: 300, border: '1px solid #77B1D4' } }}
          >
            <Typography variant="caption" sx={{ fontWeight: 'bold', display: 'block', px: 1, pb: 0.5, color: '#517891' }}>
              Toggle Columns
            </Typography>
            <Divider sx={{ mb: 1 }} />
            {columns.map(c => (
              <Box key={c.id} sx={{ px: 1, py: 0.25 }}>
                <FormControlLabel
                  control={
                    <Checkbox 
                      size="small"
                      checked={visibleColumnIds.has(c.id)}
                      onChange={() => handleToggleColumn(c.id)}
                      sx={{ color: '#57B9FF', '&.Mui-checked': { color: '#57B9FF' } }}
                    />
                  }
                  label={<Typography sx={{ fontSize: '0.85rem' }}>{c.label}</Typography>}
                />
              </Box>
            ))}
          </Menu>

          <Button
            size="small"
            variant="outlined"
            onClick={handleExportCSV}
            startIcon={<FileDownloadIcon fontSize="small" />}
            sx={{ height: 32, borderColor: '#77B1D4', color: '#517891', '&:hover': { borderColor: '#57B9FF' } }}
          >
            Export CSV
          </Button>
          <Button
            size="small"
            variant="outlined"
            onClick={handleExportCSV}
            startIcon={<FileDownloadIcon fontSize="small" />}
            sx={{ height: 32, borderColor: '#77B1D4', color: '#517891', '&:hover': { borderColor: '#57B9FF' } }}
          >
            Export Excel
          </Button>
        </Box>
      </Box>

      {/* 2. Bulk Actions Bar */}
      {selectedIds.size > 0 && bulkActions.length > 0 && (
        <Toolbar sx={{ backgroundColor: 'rgba(144, 213, 255, 0.15)', borderRadius: '4px', border: '1px solid #77B1D4', mb: 1, minHeight: '44px !important', px: 2 }}>
          <Typography variant="body2" sx={{ fontWeight: 600, color: '#517891', flexGrow: 1 }}>
            {selectedIds.size} row(s) selected
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            {bulkActions.map((act, idx) => (
              <Button
                key={idx}
                size="small"
                variant="contained"
                onClick={() => { act.action(Array.from(selectedIds)); setSelectedIds(new Set()); }}
                sx={{ height: 28, fontSize: '0.75rem', backgroundColor: '#57B9FF', color: '#FFFFFF', '&:hover': { backgroundColor: '#3da5f0' } }}
              >
                {act.label}
              </Button>
            ))}
          </Box>
        </Toolbar>
      )}

      {/* 3. Main Data Table */}
      <TableContainer component={Paper} sx={{ backgroundColor: '#FFFFFF', border: '1px solid #77B1D4', borderRadius: '4px', maxHeight: 520, overflowX: 'auto' }}>
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow>
              {bulkActions.length > 0 && (
                <TableCell padding="checkbox" sx={{ width: 40, backgroundColor: '#517891 !important', color: '#FFFFFF' }}>
                  <Checkbox
                    size="small"
                    checked={processedRows.length > 0 && selectedIds.size === processedRows.length}
                    indeterminate={selectedIds.size > 0 && selectedIds.size < processedRows.length}
                    onChange={handleSelectAll}
                    sx={{ color: 'rgba(255,255,255,0.7)', '&.Mui-checked': { color: '#FFFFFF' }, '&.MuiCheckbox-indeterminate': { color: '#FFFFFF' } }}
                  />
                </TableCell>
              )}
              {activeColumns.map((col) => (
                <TableCell
                  key={col.id}
                  align={col.align || 'left'}
                  onClick={() => col.sortable && handleSort(col.id)}
                  sx={{ 
                    cursor: col.sortable ? 'pointer' : 'default',
                    userSelect: 'none',
                    backgroundColor: '#517891 !important',
                    color: '#FFFFFF !important',
                    fontWeight: 600,
                    fontSize: '13px',
                    padding: '8px',
                    wordBreak: 'break-word',
                    whiteSpace: 'normal',
                    '&:hover': col.sortable ? { backgroundColor: '#45667c !important' } : {}
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    {col.label}
                    {col.sortable && sortColumn === col.id && (
                      sortDirection === 'asc' ? <ArrowUpwardIcon fontSize="inherit" /> : <ArrowDownwardIcon fontSize="inherit" />
                    )}
                  </Box>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedRows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={activeColumns.length + (bulkActions.length > 0 ? 1 : 0)} align="center" sx={{ py: 4, color: '#64748B' }}>
                  No matching records found.
                </TableCell>
              </TableRow>
            ) : (
              paginatedRows.map((row) => {
                const id = row[rowKey];
                const isSelected = selectedIds.has(id);
                return (
                  <TableRow
                    key={id}
                    hover
                    onClick={() => onRowClick && onRowClick(row)}
                    sx={{ 
                      cursor: onRowClick ? 'pointer' : 'default',
                      backgroundColor: isSelected ? 'rgba(144, 213, 255, 0.1) !important' : 'inherit'
                    }}
                  >
                    {bulkActions.length > 0 && (
                      <TableCell padding="checkbox" onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          size="small"
                          checked={isSelected}
                          onChange={(e) => handleSelectRow(e, id)}
                          sx={{ color: '#77B1D4', '&.Mui-checked': { color: '#57B9FF' } }}
                        />
                      </TableCell>
                    )}
                    {activeColumns.map((col) => (
                      <TableCell key={col.id} align={col.align || 'left'} sx={{ wordBreak: 'break-word', whiteSpace: 'normal' }}>
                        {col.render ? col.render(row) : (row[col.id] || '')}
                      </TableCell>
                    ))}
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* 4. Footer Pagination */}
      <TablePagination
        rowsPerPageOptions={[5, 10, 25, 50]}
        component="div"
        count={processedRows.length}
        rowsPerPage={rowsPerPage}
        page={currentPage}
        onPageChange={(e, newPage) => setCurrentPage(newPage)}
        onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setCurrentPage(0); }}
        sx={{ borderTop: 'none', '.MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows': { fontSize: '0.8rem' } }}
      />
    </Box>
  );
};

export default EnterpriseTable;
