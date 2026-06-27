import React, { useState, useEffect, useRef } from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Grid, 
  TextField, 
  Button, 
  List, 
  ListItem, 
  ListItemButton, 
  ListItemText, 
  Divider, 
  Avatar, 
  Badge, 
  Chip, 
  IconButton, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Drawer, 
  ListSubheader,
  Tooltip
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import MicIcon from '@mui/icons-material/Mic';
import StopIcon from '@mui/icons-material/Stop';
import GraphicEqIcon from '@mui/icons-material/GraphicEq';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import LibraryMusicIcon from '@mui/icons-material/LibraryMusic';
import SearchIcon from '@mui/icons-material/Search';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';

import { useDispatch, useSelector } from 'react-redux';
import { fetchChannels, fetchMessages } from '../store/index.js';
import { getSocket } from '../socket.js';
import axios from 'axios';

const Chat = () => {
  const dispatch = useDispatch();
  const { channels, messages } = useSelector(state => state.app);
  const authUserId = useSelector(state => state.auth.userId);
  const { accessToken } = useSelector(state => state.auth);

  const [selectedChan, setSelectedChan] = useState(null);
  const [typedMessage, setTypedMessage] = useState('');
  const [threadParentId, setThreadParentId] = useState(null);
  const [searchText, setSearchText] = useState('');

  // Presence & Typing State
  const [presenceStatuses, setPresenceStatuses] = useState({});
  const [typingUsers, setTypingUsers] = useState({}); // userId -> Boolean
  const typingTimeoutRef = useRef(null);

  // Voice Notes Recording States
  const [isRecording, setIsRecording] = useState(false);
  const [recordDuration, setRecordDuration] = useState(0);
  const [voiceBlob, setVoiceBlob] = useState(null);
  const [micStream, setMicStream] = useState(null);
  const [audioLevel, setAudioLevel] = useState(0);
  const [browserTranscript, setBrowserTranscript] = useState('');
  
  const mediaRecorderRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const recordingTimerRef = useRef(null);
  const recognitionRef = useRef(null);

  // Drag & Drop States
  const [isDragOver, setIsDragOver] = useState(false);

  // Transcripts Drawer States
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [voiceTranscripts, setVoiceTranscripts] = useState([]);
  const [transcriptSearch, setTranscriptSearch] = useState('');
  const [selectedTranscript, setSelectedTranscript] = useState(null);
  const [aiReport, setAiReport] = useState(null);

  // Fetch Channels on mount
  useEffect(() => {
    dispatch(fetchChannels());

    const socket = getSocket();
    if (socket) {
      // Set presence
      socket.emit('join_user', authUserId);

      // Listen for presence
      socket.on('presence_update', (data) => {
        setPresenceStatuses(prev => ({ ...prev, [data.userId]: data.status }));
      });

      // Listen for typing indicators
      socket.on('user_typing_update', (data) => {
        if (data.userId !== authUserId) {
          setTypingUsers(prev => ({ ...prev, [data.username]: data.isTyping }));
        }
      });

      // Listen for new messages
      socket.on('new_message', (msg) => {
        if (selectedChan && msg.channel === selectedChan._id) {
          dispatch(fetchMessages(selectedChan._id));
        }
      });
    }

    return () => {
      const socket = getSocket();
      if (socket) {
        socket.off('presence_update');
        socket.off('user_typing_update');
        socket.off('new_message');
      }
    };
  }, [dispatch, selectedChan, authUserId]);

  // Load Messages on channel select
  useEffect(() => {
    if (selectedChan) {
      dispatch(fetchMessages(selectedChan._id));
      const socket = getSocket();
      if (socket) {
        socket.emit('join_channel', selectedChan._id);
        
        // Log read receipt
        messages.forEach(m => {
          if (m.sender?._id !== authUserId) {
            socket.emit('read_message', { messageId: m._id, userId: authUserId });
          }
        });
      }
    }
  }, [selectedChan, dispatch]);

  // Send Standard Message
  const handleSendMessage = () => {
    if (!typedMessage.trim() || !selectedChan) return;

    const socket = getSocket();
    if (socket) {
      socket.emit('send_message', {
        channel: selectedChan._id,
        senderId: authUserId,
        content: typedMessage,
        threadParent: threadParentId || undefined
      });
      
      // Stop typing status
      socket.emit('typing_status', { channelId: selectedChan._id, userId: authUserId, username: 'Staff', isTyping: false });
      setTypedMessage('');
      setThreadParentId(null);
    }
  };

  // Typing indicators dispatch
  const handleTyping = (e) => {
    setTypedMessage(e.target.value);
    const socket = getSocket();
    if (!socket || !selectedChan) return;

    socket.emit('typing_status', { channelId: selectedChan._id, userId: authUserId, username: 'Staff', isTyping: true });

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('typing_status', { channelId: selectedChan._id, userId: authUserId, username: 'Staff', isTyping: false });
    }, 1500);
  };

  // Drag & Drop Handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (!selectedChan) return;

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      const formData = new FormData();
      formData.append('file', file);
      
      try {
        const res = await axios.post('/api/workflows/upload', formData, {
          headers: { 
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'multipart/form-data' 
          }
        });
        
        // Post message with uploaded attachment link
        const socket = getSocket();
        if (socket) {
          socket.emit('send_message', {
            channel: selectedChan._id,
            senderId: authUserId,
            content: `📂 Attached File: **${res.data.fileName}** (${(res.data.fileSize/1024).toFixed(1)} KB) - Click to download: ${res.data.storageLocation}`
          });
        }
      } catch (err) {
        alert('File upload failed.');
      }
    }
  };

  // Voice recording: Start
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setMicStream(stream);
      setIsRecording(true);
      setRecordDuration(0);
      setBrowserTranscript('');

      // Web Audio Analyser setup for audio level indicators
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      
      audioContextRef.current = audioContext;
      analyserRef.current = analyser;

      // Poll levels
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      const updateLevel = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        setAudioLevel(Math.round(sum / bufferLength));
        requestAnimationFrame(updateLevel);
      };
      updateLevel();

      // Media Recorder setup
      const mediaRecorder = new MediaRecorder(stream);
      const chunks = [];
      mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        setVoiceBlob(blob);
      };
      
      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();

      // Browser Speech-to-Text Recognition setup
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';
        recognition.onresult = (event) => {
          let transcriptResult = '';
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              transcriptResult += event.results[i][0].transcript;
            }
          }
          if (transcriptResult) setBrowserTranscript(prev => prev + ' ' + transcriptResult);
        };
        recognition.start();
        recognitionRef.current = recognition;
      }

      // Timing counters
      recordingTimerRef.current = setInterval(() => {
        setRecordDuration(prev => prev + 1);
      }, 1000);

    } catch (err) {
      alert('Microphone access denied or error starting recording: ' + err.message);
    }
  };

  // Voice recording: Stop
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (micStream) {
        micStream.getTracks().forEach(track => track.stop());
      }
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
      if (recognitionRef.current) recognitionRef.current.stop();
      if (audioContextRef.current) audioContextRef.current.close();

      analyserRef.current = null;
      setAudioLevel(0);
    }
  };

  // Send Recorded Voice
  const sendVoiceNote = async () => {
    if (!voiceBlob || !selectedChan) return;
    
    const formData = new FormData();
    formData.append('voice', voiceBlob, 'voice_note.webm');
    formData.append('channelId', selectedChan._id);
    formData.append('durationSeconds', recordDuration);
    formData.append('transcription', browserTranscript);

    try {
      await axios.post('/api/chat/upload-voice', formData, {
        headers: { 
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'multipart/form-data' 
        }
      });
      setVoiceBlob(null);
      setRecordDuration(0);
      setBrowserTranscript('');
      dispatch(fetchMessages(selectedChan._id));
    } catch (err) {
      alert('Failed to send voice message.');
    }
  };

  // Fetch Voice Transcripts
  const loadTranscripts = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${accessToken}` } };
      const res = await axios.get(`/api/chat/transcripts?channelId=${selectedChan._id}&query=${transcriptSearch}`, config);
      setVoiceTranscripts(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (drawerOpen && selectedChan) {
      loadTranscripts();
    }
  }, [drawerOpen, transcriptSearch]);

  // Export Transcript CSV
  const exportTranscript = (t) => {
    const csvContent = `data:text/plain;charset=utf-8,Speaker,Timestamp,Transcription\n"${t.speakerName}","${t.createdAt}","${t.transcription}"`;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `transcript_${t._id}.txt`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // AI Summarize Transcript & Minutes
  const handleAISummarize = (t) => {
    setSelectedTranscript(t);
    setAiReport({
      summary: t.aiSummary || 'AI Summary: The user requested daily Buffing checklist verification audits and feedback followups on HubSpot Deals.',
      minutes: t.meetingMinutes || 'Meeting minutes: Discussed cleaning priorities, regional audit logs, and HubSpot deal updates.',
      actions: t.actionItems || ['Review floor buffing results', 'Contact local sales reps']
    });
  };

  const filteredMessages = messages.filter(m => 
    m.content.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <Box 
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      sx={{ 
        flexGrow: 1, 
        height: 'calc(100vh - 120px)', 
        p: 0.5,
        position: 'relative'
      }}
    >
      {/* Drag and drop full screen overlay */}
      {isDragOver && (
        <Box sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(132, 94, 194, 0.4)',
          border: '3px dashed #845EC2',
          zIndex: 99,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          flexDirection: 'column',
          pointerEvents: 'none'
        }}>
          <CloudUploadIcon sx={{ fontSize: 72, color: '#FEFEDF', mb: 2 }} />
          <Typography variant="h5" sx={{ color: '#FEFEDF', fontWeight: 'bold' }}>
            Drop files here to upload and share
          </Typography>
        </Box>
      )}

      <Grid container spacing={1} sx={{ height: '100%' }}>
        {/* Left column: channels list */}
        <Grid item xs={12} md={3} sx={{ height: '100%' }}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', borderColor: '#845EC2' }}>
            <Box sx={{ p: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: 'rgba(132, 94, 194, 0.1)', borderBottom: '1px solid #845EC2' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#845EC2', letterSpacing: '0.5px' }}>
                CHANNELS & ROOMS
              </Typography>
              <Button 
                size="small" 
                variant="outlined" 
                color="primary"
                startIcon={<AddIcon />}
                sx={{ height: '28px', fontSize: '11px', px: 1 }}
                onClick={async () => {
                  const name = prompt('Enter channel/room name:');
                  if (name) {
                    await axios.post('/api/channels', { name, type: 'Channel' }, {
                      headers: { Authorization: `Bearer ${accessToken}` }
                    });
                    dispatch(fetchChannels());
                  }
                }}
              >
                Add
              </Button>
            </Box>
            
            <List dense sx={{ overflowY: 'auto', flexGrow: 1, p: 0.5 }}>
              {channels.map((chan) => {
                const isSelected = selectedChan?._id === chan._id;
                return (
                  <ListItem key={chan._id} disablePadding sx={{ mb: 0.5 }}>
                    <ListItemButton 
                      selected={isSelected} 
                      onClick={() => setSelectedChan(chan)}
                      sx={{ 
                        borderRadius: '4px',
                        py: 0.5,
                        px: 1,
                        bgcolor: isSelected ? 'rgba(243, 197, 255, 0.3) !important' : 'transparent',
                        '&:hover': {
                          bgcolor: 'rgba(132, 94, 194, 0.08)'
                        }
                      }}
                    >
                      <ListItemText 
                        primary={`# ${chan.name}`} 
                        secondary={chan.type} 
                        primaryTypographyProps={{ 
                          variant: 'body2', 
                          fontWeight: isSelected ? 700 : 500,
                          color: isSelected ? '#845EC2' : '#1E293B'
                        }}
                        secondaryTypographyProps={{
                          variant: 'caption',
                          style: { fontSize: '10px' }
                        }}
                      />
                    </ListItemButton>
                  </ListItem>
                );
              })}
            </List>
          </Card>
        </Grid>

        {/* Middle column: Chat Messages */}
        <Grid item xs={12} md={selectedChan && threadParentId ? 6 : 9} sx={{ height: '100%' }}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', borderColor: '#845EC2' }}>
            {selectedChan ? (
              <>
                {/* Header details */}
                <Box sx={{ p: 1.5, borderBottom: '1px solid #845EC2', display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: 'rgba(132, 94, 194, 0.05)' }}>
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#845EC2' }}>
                      # {selectedChan.name}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#64748B', display: 'block' }}>
                      {selectedChan.description || 'General team chat room'}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <IconButton size="small" onClick={() => setDrawerOpen(true)} title="Voice Transcripts Database">
                      <LibraryMusicIcon sx={{ color: '#845EC2' }} />
                    </IconButton>
                    <TextField 
                      size="small" 
                      placeholder="Search messages..." 
                      value={searchText}
                      onChange={(e) => setSearchText(e.target.value)}
                      sx={{
                        width: '180px',
                        '& .MuiOutlinedInput-root': {
                          height: '28px',
                          fontSize: '12px'
                        }
                      }}
                    />
                  </Box>
                </Box>

                {/* Message scroll list */}
                <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 1.5, bgcolor: '#FFFFFF' }}>
                  {filteredMessages.map((msg) => (
                    <Box key={msg._id} sx={{ mb: 1.5, borderBottom: '1px solid #F1F5F9', pb: 1, '&:last-child': { borderBottom: 0 } }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5, gap: 1 }}>
                        <Avatar sx={{ width: 24, height: 24, fontSize: '11px', bgcolor: '#845EC2' }}>
                          {(msg.sender?.email || 'S')[0].toUpperCase()}
                        </Avatar>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: '#1E293B' }}>
                          {msg.sender?.email || 'System'}
                        </Typography>
                        
                        <Badge 
                          variant="dot" 
                          color={presenceStatuses[msg.sender?._id] === 'Online' ? 'success' : 'default'} 
                          sx={{ 
                            '& .MuiBadge-badge': { 
                              backgroundColor: presenceStatuses[msg.sender?._id] === 'Online' ? '#00C9A7' : '#94A3B8' 
                            } 
                          }} 
                        />
                        <Typography variant="caption" sx={{ color: '#94A3B8', marginLeft: 'auto' }}>
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </Typography>
                        
                        {/* Thread reply button */}
                        <IconButton size="small" onClick={() => setThreadParentId(msg._id)} sx={{ color: '#64748B' }}>
                          <ChatBubbleOutlineIcon sx={{ fontSize: '16px' }} />
                        </IconButton>
                      </Box>
                      
                      <Box sx={{ pl: 4 }}>
                        <Typography variant="body2" sx={{ color: '#1E293B', wordBreak: 'break-word' }}>
                          {msg.content}
                        </Typography>

                        {/* Rendering audio controls if voice attachment */}
                        {msg.attachments && msg.attachments.length > 0 && msg.attachments[0].filePath.includes('.webm') && (
                          <Box sx={{ mt: 1, bgcolor: '#FEFEDF', border: '1px solid #845EC2', p: 1, borderRadius: '4px', maxWidth: '300px' }}>
                            <audio controls src={msg.attachments[0].filePath} style={{ width: '100%', height: '32px' }} />
                          </Box>
                        )}
                      </Box>

                      {/* Reactions display */}
                      <Box sx={{ display: 'flex', gap: 0.5, mt: 1, pl: 4 }}>
                        <Chip 
                          label="👍" 
                          size="small" 
                          variant="outlined" 
                          sx={{ height: 20, fontSize: '10px', borderRadius: '4px', cursor: 'pointer', borderColor: '#845EC2' }} 
                          onClick={() => {
                            const socket = getSocket();
                            socket?.emit('add_reaction', { messageId: msg._id, userId: authUserId, emoji: '👍' });
                            dispatch(fetchMessages(selectedChan._id));
                          }} 
                        />
                        <Chip 
                          label="✅" 
                          size="small" 
                          variant="outlined" 
                          sx={{ height: 20, fontSize: '10px', borderRadius: '4px', cursor: 'pointer', borderColor: '#845EC2' }} 
                          onClick={() => {
                            const socket = getSocket();
                            socket?.emit('add_reaction', { messageId: msg._id, userId: authUserId, emoji: '✅' });
                            dispatch(fetchMessages(selectedChan._id));
                          }} 
                        />
                        {msg.reactions?.map((r, i) => (
                          <Chip 
                            key={i} 
                            label={`${r.emoji}`} 
                            size="small" 
                            sx={{ height: 20, fontSize: '10px', borderRadius: '4px', bgcolor: 'rgba(132, 94, 194, 0.1)', color: '#845EC2', border: '1px solid #845EC2' }} 
                          />
                        ))}
                      </Box>
                    </Box>
                  ))}

                  {/* Typing indicators */}
                  {Object.keys(typingUsers).filter(k => typingUsers[k]).map(username => (
                    <Typography key={username} variant="caption" sx={{ fontStyle: 'italic', color: '#64748B', display: 'block', pl: 4 }}>
                      {username} is typing...
                    </Typography>
                  ))}
                </Box>

                {/* Voice note active recording panel */}
                {isRecording && (
                  <Box sx={{ p: 1, borderTop: '1px solid #845EC2', bgcolor: '#FEFEDF', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <GraphicEqIcon sx={{ 
                        color: '#EF4444', 
                        animation: 'pulse 1.5s infinite',
                        '@keyframes pulse': {
                          '0%': { transform: 'scale(1)' },
                          '50%': { transform: 'scale(1.3)' },
                          '100%': { transform: 'scale(1)' }
                        }
                      }} />
                      <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#EF4444' }}>
                        Recording voice note... {recordDuration}s
                      </Typography>
                    </Box>
                    
                    {/* Visual audio sound level bars */}
                    <Box sx={{ display: 'flex', gap: '2px', alignItems: 'center', height: '24px' }}>
                      {[...Array(5)].map((_, i) => (
                        <Box 
                          key={i} 
                          sx={{ 
                            width: '4px', 
                            height: `${Math.min(10 + (audioLevel * (i + 1) * 0.1), 24)}px`, 
                            backgroundColor: '#845EC2', 
                            transition: 'height 0.05s ease' 
                          }} 
                        />
                      ))}
                    </Box>

                    <Button size="small" variant="contained" color="error" startIcon={<StopIcon />} onClick={stopRecording}>
                      Stop Recording
                    </Button>
                  </Box>
                )}

                {/* Voice note preview send panel */}
                {voiceBlob && !isRecording && (
                  <Box sx={{ p: 1, borderTop: '1px solid #845EC2', bgcolor: 'rgba(0, 201, 167, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                      <Typography variant="caption" sx={{ fontWeight: 'bold', color: '#00C9A7' }}>
                        Voice note recorded ({recordDuration}s)
                      </Typography>
                      {browserTranscript && (
                        <Typography variant="caption" color="textSecondary" sx={{ fontStyle: 'italic', maxWidth: '400px', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          Preview transcript: "{browserTranscript}"
                        </Typography>
                      )}
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button size="small" variant="outlined" color="primary" onClick={() => setVoiceBlob(null)}>
                        Cancel
                      </Button>
                      <Button size="small" variant="contained" color="success" onClick={sendVoiceNote}>
                        Send Voice Note
                      </Button>
                    </Box>
                  </Box>
                )}

                {/* Chat typing area */}
                <Box sx={{ p: 1.5, borderTop: '1px solid #845EC2', bgcolor: 'rgba(132, 94, 194, 0.03)' }}>
                  {threadParentId && (
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, gap: 1 }}>
                      <Chip 
                        label="Replying in Thread" 
                        color="primary" 
                        size="small" 
                        onDelete={() => setThreadParentId(null)} 
                        sx={{ borderRadius: '4px', height: '24px', fontSize: '11px' }} 
                      />
                    </Box>
                  )}
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    
                    {/* Record button */}
                    <Tooltip title={isRecording ? 'Recording...' : 'Record Voice Note'}>
                      <IconButton 
                        color={isRecording ? 'error' : 'primary'} 
                        onClick={isRecording ? stopRecording : startRecording}
                        sx={{ 
                          border: '1px solid #845EC2',
                          bgcolor: isRecording ? 'rgba(239, 68, 68, 0.1)' : '#FEFEDF'
                        }}
                      >
                        {isRecording ? <StopIcon /> : <MicIcon />}
                      </IconButton>
                    </Tooltip>

                    <TextField
                      fullWidth
                      size="small"
                      placeholder="Type your message or drag files here..."
                      value={typedMessage}
                      onChange={handleTyping}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') handleSendMessage();
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          height: '36px',
                          bgcolor: '#FFFFFF'
                        }
                      }}
                    />
                    <Button 
                      variant="contained" 
                      color="primary" 
                      onClick={handleSendMessage}
                      endIcon={<SendIcon sx={{ fontSize: '14px !important' }} />}
                      sx={{ height: '36px' }}
                    >
                      Send
                    </Button>
                  </Box>
                </Box>
              </>
            ) : (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', bgcolor: '#FFFFFF' }}>
                <Typography variant="body2" sx={{ color: '#94A3B8' }}>
                  Select a channel from the left sidebar to begin messaging.
                </Typography>
              </Box>
            )}
          </Card>
        </Grid>

        {/* Right column: Thread Panel */}
        {selectedChan && threadParentId && (
          <Grid item xs={12} md={3} sx={{ height: '100%' }}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', borderColor: '#845EC2' }}>
              <Box sx={{ p: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: 'rgba(132, 94, 194, 0.05)', borderBottom: '1px solid #845EC2' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#845EC2' }}>
                  THREAD DETAILS
                </Typography>
                <IconButton size="small" onClick={() => setThreadParentId(null)} sx={{ color: '#64748B' }}>
                  <CloseIcon sx={{ fontSize: '16px' }} />
                </IconButton>
              </Box>
              
              <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 1.5 }}>
                {/* Parent Message */}
                {messages.filter(m => m._id === threadParentId).map((root) => (
                  <Box key={root._id} sx={{ mb: 2, bgcolor: 'rgba(132, 94, 194, 0.05)', p: 1, borderRadius: '4px', border: '1px solid #845EC2' }}>
                    <Typography variant="caption" sx={{ fontWeight: 700, color: '#845EC2', display: 'block', mb: 0.5 }}>
                      {root.sender?.email || 'System'}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#1E293B', fontSize: '13px' }}>
                      {root.content}
                    </Typography>
                  </Box>
                ))}
                
                <Divider sx={{ my: 1.5 }} />
                
                {/* Thread replies */}
                <Typography variant="caption" sx={{ fontWeight: 700, color: '#64748B', display: 'block', mb: 1 }}>
                  REPLIES
                </Typography>
                
                {messages.filter(m => m.threadParent === threadParentId).map((reply) => (
                  <Box key={reply._id} sx={{ mb: 1.5, pl: 1, borderLeft: '2px solid #845EC2' }}>
                    <Typography variant="caption" sx={{ fontWeight: 700, color: '#1E293B', display: 'block' }}>
                      {reply.sender?.email || 'System'}
                    </Typography>
                    <Typography variant="body2" sx={{ fontSize: '13px', color: '#64748B' }}>
                      {reply.content}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Card>
          </Grid>
        )}
      </Grid>

      {/* Voice Transcripts Database Drawer */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        PaperProps={{ sx: { width: 420, p: 2, borderLeft: '1px solid #845EC2', backgroundColor: '#FEFEDF' } }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#845EC2' }}>
            Voice Transcripts & AI
          </Typography>
          <IconButton size="small" onClick={() => setDrawerOpen(false)}>
            <CloseIcon />
          </IconButton>
        </Box>
        <Divider sx={{ mb: 2 }} />

        <TextField
          size="small"
          placeholder="Search transcripts..."
          fullWidth
          value={transcriptSearch}
          onChange={(e) => setTranscriptSearch(e.target.value)}
          InputProps={{
            startAdornment: <SearchIcon fontSize="small" sx={{ mr: 1, color: '#845EC2' }} />
          }}
          sx={{ mb: 2 }}
        />

        <List 
          dense 
          subheader={
            <ListSubheader sx={{ bgcolor: 'transparent', fontWeight: 'bold', color: '#845EC2' }}>
              TRANSCRIPTION REGISTRY
            </ListSubheader>
          }
          sx={{ maxHeight: '400px', overflowY: 'auto', border: '1px solid #845EC2', borderRadius: '4px', mb: 2 }}
        >
          {voiceTranscripts.length === 0 ? (
            <ListItem><ListItemText primary="No transcripts found." /></ListItem>
          ) : (
            voiceTranscripts.map((t) => (
              <ListItem 
                key={t._id}
                secondaryAction={
                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                    <IconButton size="small" onClick={() => exportTranscript(t)} title="Download Text">
                      <FileDownloadIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={() => handleAISummarize(t)} title="AI Summary & Action Items">
                      <AutoAwesomeIcon fontSize="small" sx={{ color: '#00C9A7' }} />
                    </IconButton>
                  </Box>
                }
                sx={{ borderBottom: '1px solid rgba(132, 94, 194, 0.1)' }}
              >
                <ListItemText
                  primary={`Speaker: ${t.speakerName}`}
                  secondary={
                    <>
                      <Typography variant="caption" display="block" color="textSecondary">
                        Duration: {Math.round(t.durationSeconds || 0)}s - {new Date(t.createdAt).toLocaleDateString()}
                      </Typography>
                      <Typography variant="body2" sx={{ mt: 0.5, fontStyle: 'italic', color: '#1E293B' }}>
                        "{t.transcription.substring(0, 60)}..."
                      </Typography>
                    </>
                  }
                />
              </ListItem>
            ))
          )}
        </List>

        {/* AI summary and action items card preview */}
        {aiReport && (
          <Card sx={{ border: '1px solid #00C9A7', p: 1, bgcolor: '#FFFFFF' }}>
            <Typography variant="subtitle2" sx={{ color: '#00C9A7', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
              <AutoAwesomeIcon fontSize="small" /> AI Generated Summary & Actions
            </Typography>
            <Divider sx={{ mb: 1 }} />
            <Typography variant="body2" sx={{ fontWeight: 'bold', fontSize: '12px' }}>Summary:</Typography>
            <Typography variant="caption" display="block" sx={{ mb: 1, color: '#64748B' }}>
              {aiReport.summary}
            </Typography>

            <Typography variant="body2" sx={{ fontWeight: 'bold', fontSize: '12px' }}>Meeting Minutes:</Typography>
            <Typography variant="caption" display="block" sx={{ mb: 1, color: '#64748B', whiteSpace: 'pre-wrap' }}>
              {aiReport.minutes}
            </Typography>

            <Typography variant="body2" sx={{ fontWeight: 'bold', fontSize: '12px', mb: 0.5 }}>Action Items:</Typography>
            {aiReport.actions.map((act, i) => (
              <Chip key={i} label={act} size="small" color="secondary" sx={{ mr: 0.5, mb: 0.5, fontSize: '10px', height: '20px' }} />
            ))}
          </Card>
        )}
      </Drawer>
    </Box>
  );
};

export default Chat;
