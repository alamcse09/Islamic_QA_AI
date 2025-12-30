from fastapi import FastAPI
from pydantic import BaseModel
from langchain_ollama import ChatOllama
import uvicorn
from langchain_community.embeddings import OllamaEmbeddings
from langchain_community.vectorstores import Chroma
import os
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, change this to your react URL
    allow_methods=["*"],
    allow_headers=["*"],
)

llm = ChatOllama(model="llama3.2")
current_dir = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(current_dir, "knowledge_HF_db")

embeddings = OllamaEmbeddings(model="nomic-embed-text")
vectorstore = None
retriever = None

def load_db():
    global vectorstore, retriever
    vectorstore = Chroma(
        persist_directory=DB_PATH,
        embedding_function=embeddings,
        collection_name="hf_knowledge"
    )

    retriever = vectorstore.as_retriever()

@app.on_event("startup")
async def startup_event():
    # Now load it into memory
    load_db()
    print("--- Server is ready and DB is loaded ---")

class Query(BaseModel):
    question: str

@app.post("/ask")
async def ask_question(query: Query):
    print("--- Searching the database... ---")
    docs = retriever.invoke(query.question)
    print(f"--- Found {len(docs)} relevant chunks. ---")
    if(len(docs)==0):
        return {"answer":"Couldn't find relevant answer"}
    
    context = "\n\n".join([d.page_content for d in docs])

    prompt = f"Use this knowledge to answer: {context}\n\nUser Question:{query.question}"
    async def generate_response():
        async for chunk in llm.astream(prompt):
            yield chunk.content

    return StreamingResponse(
        generate_response(), 
        media_type="text/event-stream",
        headers={
            "X-Content-Type-Options": "nosniff",
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
        }
    )

@app.get("/all")
async def get_all():
    data = vectorstore.get()

    print(f"Total chunks found: {len(data['ids'])}")
    if len(data['documents']) > 0:
        print("First chunk content sample:")
        print(data['documents'][0])
    return ""

if __name__ == "__main__":
    uvicorn.run(app, host="localhost", port=8000)