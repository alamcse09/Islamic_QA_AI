import React, { useState } from 'react'
import './App.css'
import { Container, TextField, Button, Box, Typography, Paper, CircularProgress, Divider, Stack } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';

function App() {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const askAgent = async () => {
    if (!question.trim()) return;

    setIsLoading(true);
    setError('');
    setAnswer('');

    try{
      const response = await fetch(`http://localhost:8000/ask`, {
        method: 'POST',
        headers: {
          'Content-Type' : 'application/json',
        },
        body: JSON.stringify({question: question}),
      });

      if(!response.ok){
        throw new Error(`Server error: ${response.status}`);
      }

      // 1. Get the stream reader and a text decoder
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedAnswer = "";

      // 2. Read the stream in a loop
      while (true) {
        const { done, value } = await reader.read();
        if (done) break; // Stream is finished

        // 3. Decode the chunk and update state immediately
        const chunk = decoder.decode(value, { stream: true });
        accumulatedAnswer += chunk;
        
        // Use the functional update to ensure we have the latest string
        setAnswer(accumulatedAnswer);
      }
    } catch(err){
      setError(err.message);
    } finally{
      setIsLoading(false);
    }
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
        <Box sx={{ minHeight: '200px', mb: 4, p: 2, borderRadius: 2, bgcolor: '#f9f9f9', border: '1px solid #e0e0e0' }}>
          {!answer && !isLoading && (
            <Typography variant="body1" color="text.disabled" align="center" sx={{ mt: 8 }}>
              Your answer will appear here...
            </Typography>
          )}
          {answer && (
            <Typography variant="body1" sx={{ whiteSpace: 'pre-line', lineHeight: 1.7 }}>
              <strong>Agent:</strong> {answer}
              {isLoading && <span className="cursor"> ▎</span>}
            </Typography>
          )}
          {error && <Typography color="error" sx={{ mt: 2 }}>{error}</Typography>}
        </Box>

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
