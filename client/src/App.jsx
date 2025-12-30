import React, { useState } from 'react'
import './App.css'
import { Container, TextField, Button, Box, Typography, Paper, CircularProgress, Divider, Stack } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import History from './History.jsx';
import useChatAgent from './useChatAgent.js';

function App() {
  
  const {
    history,
    streamingAnswer,
    isLoading,
    error,
    askQuestion
  } = useChatAgent("http://localhost:8000/ask");

  const [question, setQuestion] = useState("");

  const askAgent = () =>{
    askQuestion(question);
    setQuestion("");
  }

  return (
    <Container maxWidth="md" sx={{py:5, display: 'flex', justifyContent: 'center'}}>
      <Paper elevation={4} sx={{ p: 4, borderRadius: 3, bgcolor: '#ffffff', width: '100%', display: 'flex', flexDirection: 'column', minHeight: '500px' }}>
        <Typography variant="h4" gutterBottom align="center" sx={{ fontWeight: 'bold', color: '#2e7d32' }}>
          Islamic QA Assistant
        </Typography>

        <Typography variant="body2" align="center" color="text.secondary" sx={{ mb: 4 }}>
          Answer questions based on the provided knowledge base.
        </Typography>

        <Divider sx={{ mb: 4 }} />

        {/* Answer Area */}
        <History history={history} streamingAnswer={streamingAnswer}/>

        {/* Input Area */}
        <Stack direction="column" spacing={2}>
          <TextField
            fullWidth
            multiline // THIS MAKES IT A TEXTAREA
            rows={3}
            placeholder="Type your question here (e.g., What are the pillars of Islam?)"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            disabled={isLoading}
            variant="outlined"
          />
          <Button
            size="large"
            variant="contained"
            color="success"
            onClick={askAgent}
            disabled={isLoading || !question.trim()}
            endIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
            sx={{ alignSelf: 'flex-end', px: 4 }}
          >
            {isLoading ? 'Thinking...' : 'Ask Agent'}
          </Button>
        </Stack>
      </Paper>
    </Container>
  )
}

export default App
