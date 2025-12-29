from fastapi import FastAPI
from pydantic import BaseModel
from langchain_ollama import ChatOllama
import uvicorn
from data_loader import ingest_json_files
from langchain_community.embeddings import OllamaEmbeddings
from langchain_community.vectorstores import Chroma
import os

app = FastAPI()
llm = ChatOllama(model="llama3.2")
DB_PATH = "./knowledge_db"

embeddings = OllamaEmbeddings(model="nomic-embed-text")
vectorstore = None
retriever = None

def load_db():
    global vectorstore, retriever
    vectorstore = Chroma(
        persist_directory=DB_PATH,
        embedding_function=embeddings,
        collection_name="json_knowledge"
    )

    retriever = vectorstore.as_retriever()

@app.on_event("startup")
async def startup_event():
    if not os.path.exists(DB_PATH) or not os.listdir(DB_PATH):
        print("--- Database missing or empty. Ingesting... ---")
        ingest_json_files("datasets")
    
    # Now load it into memory
    load_db()
    print("--- Server is ready and DB is loaded ---")

class Query(BaseModel):
    question: str

@app.get("/ask")
async def ask_question(query: str):
    print("--- Searching the database... ---")
    docs = retriever.invoke(query)
    print(f"--- Found {len(docs)} relevant chunks. ---")
    if(len(docs)==0):
        return {"answer":"Couldn't find relevant answer"}
    
    context = "\n\n".join([d.page_content for d in docs])

    prompt = f"Use this knowledge to answer: {context}\n\nUser Question:{query}"
    response = llm.invoke(prompt)

    return {"answer":response.content}

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