from datasets import load_dataset
from langchain_core.documents import Document
from langchain_ollama import OllamaEmbeddings
from langchain_chroma import Chroma
import os
from tqdm import tqdm
import time

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

embeddings = OllamaEmbeddings(model="nomic-embed-text")
vectorstore = None

for i in tqdm(range (0, len(documents), 10), desc="Inserting Documents"):
    batch = documents[i:i+10]

    if vectorstore is None:
        vectorstore = Chroma.from_documents(
            documents=batch,
            embedding=embeddings,
            persist_directory=DB_PATH,
            collection_name="hf_knowledge"
        )
    else:
        vectorstore.add_documents(documents=batch)

print("--- Ingestion Complete ---")