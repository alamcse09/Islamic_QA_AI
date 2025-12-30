import { Box, Typography} from '@mui/material';
import {useRef, useEffect} from 'react';

const History = ({history, isLoading, streamingAnswer})=>{

    const scrollToEndRef = useRef(null);
    const scrollToBottom = ()=>{
        scrollToEndRef.current?.scrollIntoView({behavior: "smooth"});
    }

    useEffect(()=>{
        scrollToBottom();
    },[history, streamingAnswer]);

    return (
        <Box sx={{ 
            width: '93%',
            height: '45vh',
            mb: 4, 
            p: 2, 
            borderRadius: 2, 
            bgcolor: '#f9f9f9', 
            border: '1px solid #e0e0e0',
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            overflow: 'auto',
            position: 'relative'
        }}>
            {(!history || history.length === 0) && !isLoading && (
                <Typography variant="body1" color="text.disabled" align="center" sx={{ mt: 8 }}>
                    Your answer will appear here...
                </Typography>
            )}

            {history && history.map((item, index) => {
                const isAgent = item.fromAgent;
                
                return (
                    <Box 
                        key={index}
                        sx={{ 
                            alignSelf: isAgent ? 'flex-start' : 'flex-end', // Aligns the box left or right
                            maxWidth: '80%',
                            bgcolor: isAgent ? '#e8f5e9' : '#e3f2fd', // Agent: Green, User: Blue
                            p: 1.5,
                            borderRadius: 2
                        }}
                    >
                        <Typography 
                            variant="body1" 
                            sx={{ whiteSpace: 'pre-line', lineHeight: 1.7 }}
                        >
                            {item.text}
                        </Typography>
                    </Box>
                );
            })}

            {streamingAnswer && (
                <Box
                    sx={{
                        alignSelf: 'flext-start',
                        maxWidth: '80%',
                        bgcolor: '#e8f5e9',
                        p: 1.5,
                        borderRadius: 2
                    }}
                >
                    <Typography
                        variant="body1"
                        sx={{whiteSpace: 'pre-line', lineHeight: 1.7}}
                    >
                        {streamingAnswer}
                        <span className="cursor"> ▎</span>
                    </Typography>
                </Box>
            )}

            {/* Dummy div to anchor the scroll */}
            <div ref={scrollToEndRef} style={{ float: "left", clear: "both" }} />
        </Box>
    );
}

export default History;