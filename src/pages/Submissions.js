import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  CircularProgress,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Chip,
} from '@mui/material';
import { Visibility as VisibilityIcon } from '@mui/icons-material';
import { adminApi } from '../services/api';
import { formatDate } from '../utils/dateUtils';

export default function Submissions() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const response = await adminApi.getAllSubmissions();
      const submissionsData = response.data.submissions || [];
      setSubmissions(submissionsData);
    } catch (err) {
      setError('Failed to fetch submissions');
      console.error('Submissions error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'accepted':
        return 'success';
      case 'wrong answer':
        return 'error';
      case 'time limit exceeded':
        return 'warning';
      case 'runtime error':
        return 'error';
      case 'compilation error':
        return 'error';
      default:
        return 'default';
    }
  };

  const handleViewCode = (submission) => {
    const decodedCode = decodeBase64(submission.code);
    setSelectedSubmission({ ...submission, code: decodedCode });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedSubmission(null);
  };

  const decodeBase64 = (str) => {
    try {
      if (!str) {
        console.log('No code string provided');
        return 'No code available';
      }
      console.log('Original base64 string:', str);
      const decoded = atob(str);
      console.log('Decoded string:', decoded);
      return decoded;
    } catch (e) {
      console.error('Error decoding base64:', e);
      return 'Error decoding code: ' + e.message;
    }
  };

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Submissions Management
      </Typography>

      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Team</TableCell>
              <TableCell>Problem</TableCell>
              <TableCell>Language</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Submitted At</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : submissions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  No submissions found
                </TableCell>
              </TableRow>
            ) : (
              submissions.map((submission) => (
                <TableRow key={submission.id}>
                  <TableCell>{submission.id}</TableCell>
                  <TableCell>{submission.Team?.team_name || 'Unknown'}</TableCell>
                  <TableCell>{submission.Problem?.title || 'Unknown'}</TableCell>
                  <TableCell>{submission.language || 'Unknown'}</TableCell>
                  <TableCell>
                    <Chip
                      label={submission.result}
                      color={getStatusColor(submission.result)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{formatDate(submission.submitted_at)}</TableCell>
                  <TableCell align="right">
                    <Tooltip title="View Code">
                      <IconButton
                        size="small"
                        onClick={() => handleViewCode(submission)}
                      >
                        <VisibilityIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Submission Code - {selectedSubmission?.Problem?.title}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Team: {selectedSubmission?.Team?.team_name}
            </Typography>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Status: {selectedSubmission?.result}
            </Typography>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Submitted: {selectedSubmission?.submitted_at && formatDate(selectedSubmission.submitted_at)}
            </Typography>
            <Paper 
              sx={{ 
                mt: 2, 
                p: 2, 
                backgroundColor: '#1e1e1e',
                fontFamily: 'monospace',
                whiteSpace: 'pre-wrap',
                overflow: 'auto',
                maxHeight: '60vh'
              }}
            >
              {selectedSubmission?.code ? (
                <pre style={{ 
                  margin: 0,
                  color: '#ffffff',
                  fontSize: '14px',
                  lineHeight: '1.5'
                }}>
                  {selectedSubmission.code}
                </pre>
              ) : (
                <Typography color="text.secondary">No code available</Typography>
              )}
            </Paper>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 