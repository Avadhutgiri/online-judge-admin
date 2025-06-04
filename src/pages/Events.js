import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
  TextField,
  Typography,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StopIcon from '@mui/icons-material/Stop';
import { adminApi } from '../services/api';

export default function Events() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Create Event Dialog State
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newEventName, setNewEventName] = useState('');
  
  // Start Event Dialog State
  const [startDialogOpen, setStartDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [startTime, setStartTime] = useState('');
  const [durationMinutes, setDurationMinutes] = useState(60);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await adminApi.getAllEvents();
      const eventsData = response.data.events || [];
      setEvents(eventsData);
    } catch (err) {
      setError('Failed to fetch events');
      console.error('Events error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEvent = async () => {
    try {
      const response = await adminApi.createEvent({ name: newEventName });
      setCreateDialogOpen(false);
      setNewEventName('');
      // Add the new event to the list
      if (response.data && response.data.event) {
        setEvents(prevEvents => [...prevEvents, response.data.event]);
      }
    } catch (err) {
      setError('Failed to create event');
      console.error('Create event error:', err);
    }
  };

  const handleStartEvent = async () => {
    try {
      const response = await adminApi.startEvent({
        eventId: selectedEvent.id,
        start_time: new Date(startTime).toISOString(),
        duration_minutes: durationMinutes
      });
      setStartDialogOpen(false);
      setSelectedEvent(null);
      setStartTime('');
      // Update the event in the list
      if (response.data && response.data.event) {
        setEvents(prevEvents => 
          prevEvents.map(event => 
            event.id === response.data.event.id ? response.data.event : event
          )
        );
      }
    } catch (err) {
      setError('Failed to start event');
      console.error('Start event error:', err);
    }
  };

  const handleStopEvent = async (eventId) => {
    try {
        console.log(eventId);
      const response = await adminApi.stopEvent(eventId);
      // Update the event in the list
      if (response.data && response.data.event) {
        setEvents(prevEvents => 
          prevEvents.map(event => 
            event.id === response.data.event.id ? response.data.event : event
          )
        );
      }
    } catch (err) {
      setError('Failed to stop event');
      console.error('Stop event error:', err);
    }
  };

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Events Management</Typography>
        <Box>
          <Tooltip title="Refresh Events">
            <IconButton onClick={fetchEvents} sx={{ mr: 2 }}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          <Button
            variant="contained"
            color="primary"
            onClick={() => setCreateDialogOpen(true)}
          >
            Create New Event
          </Button>
        </Box>
      </Box>

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
              <TableCell>Event Name</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Start Time</TableCell>
              <TableCell>End Time</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : events && events.length > 0 ? (
              events.map((event) => (
                <TableRow key={event.id}>
                  <TableCell>{event.id}</TableCell>
                  <TableCell>{event.name}</TableCell>
                  <TableCell>
                    {event.is_active ? 'Active' : 'Inactive'}
                  </TableCell>
                  <TableCell>
                    {event.start_time ? new Date(event.start_time).toLocaleString() : '-'}
                  </TableCell>
                  <TableCell>
                    {event.end_time ? new Date(event.end_time).toLocaleString() : '-'}
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Tooltip title={event.is_active ? "Event is already active" : "Start Event"}>
                        <span>
                          <IconButton
                            color="primary"
                            onClick={() => {
                              if (!event.is_active) {
                                setSelectedEvent(event);
                                setStartDialogOpen(true);
                              }
                            }}
                            disabled={event.is_active}
                          >
                            <PlayArrowIcon />
                          </IconButton>
                        </span>
                      </Tooltip>
                      <Tooltip title={event.is_active ? "Stop Event" : "Event is not active"}>
                        <span>
                          <IconButton
                            color="error"
                            onClick={() => handleStopEvent(event.id)}
                            disabled={!event.is_active}
                          >
                            <StopIcon />
                          </IconButton>
                        </span>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  No events found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Create Event Dialog */}
      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)}>
        <DialogTitle>Create New Event</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Event Name"
            fullWidth
            value={newEventName}
            onChange={(e) => setNewEventName(e.target.value)}
            helperText="Enter a unique name for the event"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleCreateEvent} variant="contained">
            Create
          </Button>
        </DialogActions>
      </Dialog>

      {/* Start Event Dialog */}
      <Dialog open={startDialogOpen} onClose={() => setStartDialogOpen(false)}>
        <DialogTitle>Start Event</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="Start Time"
            type="datetime-local"
            fullWidth
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            InputLabelProps={{
              shrink: true,
            }}
            sx={{ mt: 2 }}
          />
          <TextField
            margin="dense"
            label="Duration (minutes)"
            type="number"
            fullWidth
            value={durationMinutes}
            onChange={(e) => setDurationMinutes(Number(e.target.value))}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStartDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleStartEvent} variant="contained">
            Start Event
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 