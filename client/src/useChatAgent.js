import {useState, useEffect} from 'react';

const useChatAgent = (endpoint) => {

    const [history, setHistory] = useState([]);
    const [streamingAnswer, setStreamingAnswer] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() =>{
        if(localStorage.getItem("chat_history")){
            setHistory(JSON.parse(localStorage.getItem("chat_history")));
        }
    }, []);

    const askQuestion = async (question) =>{
        if(!question.trim()) return;

        const userMessage = {
            text: question,
            fromAgent: false,
        }

        setHistory((prev) => [...prev, userMessage]);

        setIsLoading(true);
        setError("");
        setStreamingAnswer("");
        
        let accumulated = "";

        try{
            const response = await fetch(endpoint, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({question}),
            });

            if(!response.ok){
                throw new Error("Server Error");
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();

            while(true){
                const {done, value} = await reader.read();
                if(done){
                    break;
                }

                const chunk = decoder.decode(value, {stream: true});
                accumulated += chunk;
                setStreamingAnswer(accumulated);
            }

            const agentMsg = {
                text: accumulated,
                fromAgent: true,
            };

            setHistory((prev) => [...prev, agentMsg]);
            localStorage.setItem("chat_history", JSON.stringify([...history, userMessage, agentMsg]));
        } catch(error){
            setError(error.message);
        } finally{
            setStreamingAnswer("");
            setIsLoading(false);
        }
    };

    return {
        history,
        streamingAnswer,
        isLoading,
        error,
        askQuestion
    };
}

export default useChatAgent;