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
      const response = await fetch(`http://localhost:8001/ask?query=${question}`);
      if(!response.ok){
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();
      setAnswer(data.answer);
      setIsLoading(false);
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

      {answer && !isLoading && (
        <Paper elevation={3} sx={{p:3, bgcolor: '#f5f5f5'}}>
          <Typography 
            variant="body1"
            align='left' 
            sx={{ whiteSpace: 'pre-line' }}>
            <strong>Agent:</strong> {answer} 
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
