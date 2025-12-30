from datasets import load_dataset
from langchain_core.documents import Document
from langchain_ollama import OllamaEmbeddings
from langchain_chroma import Chroma
import os

current_dir = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(current_dir, "knowledge_HF_db")

print(f"--- Loading dataset ---")
ds = load_dataset("minhalvp/islamqa")

documents = []
for row in ds['train']:
    # Adjust 'question' and 'answer' based on the specific dataset's column names
    text = f"Question: {row['Question']}\nAnswer: {row['Full Answer']}"
    doc = Document(
        page_content=text,
        metadata={"source": "minhalvp/islamqa", "id": row.get('id', 'unknown')}
    )
    documents.append(doc)

print(f"--- Loaded {len(documents)} documents ---")

documents = documents[:100]
print(f"question: {documents[0]}")

embeddings = OllamaEmbeddings(model="nomic-embed-text")
vectorstore = Chroma.from_documents(
    documents=documents,
    embedding=embeddings,
    persist_directory=DB_PATH,
    collection_name="hf_knowledge"
)

print("--- Ingestion Complete ---")