import React, { useState } from 'react'
import './App.css'
import { Container, TextField, Button, Box, Typography, Paper, CircularProgress } from '@mui/material';

function App() {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const askAgent = async () => {
    setIsLoading(true);
    setError('');
    setAnswer('');

    try{
      const response = await fetch(`http://localhost:8000/ask?query=${question}`);
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
    <Container maxWidth="sm" sx={{mt:5}}>
      <Typography variant="h4">
        Islamic QA
      </Typography>

      <Box sx={{display: 'flex', gap: 2, mb: 3}}>
        <TextField 
          label="Ask your question"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
        />

        <Button
          variant="contained"
          onClick={askAgent}
          disabled = {isLoading}
          startIcon={isLoading? <CircularProgress size={20} color='inherit'/>:null}
        >
          Ask
        </Button>
      </Box>

      {answer && (
        <Paper elevation={3} sx={{p:3, bgcolor: '#f5f5f5'}}>
          <Typography 
            variant="body1"
            align='left' 
            sx={{ whiteSpace: 'pre-line' }}>
            <strong>Agent:</strong> {answer} 
            {isLoading && " ▎"}
          </Typography>
        </Paper>
      )}
      {isLoading && (
        <Typography>Loading...</Typography>
      )}
      {error && (
        <Typography sx={{color: "red"}}>{error}</Typography>
      )}
    </Container>
  )
}

export default App
