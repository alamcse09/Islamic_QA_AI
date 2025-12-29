import os
import json
from langchain_core.documents import Document
from langchain_community.vectorstores import Chroma
from langchain_community.embeddings import OllamaEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter

DB_PATH = "./knowledge_db"

def ingest_json_files(folder_path):
    embeddings = OllamaEmbeddings(model="nomic-embed-text")

    documents = []
    for filename in os.listdir(folder_path):
        with open(os.path.join(folder_path, filename),'r', encoding='utf-8') as f:
            data = json.load(f)
            for item in data:
                combined_text = f"Question: {item['question']}\nAnswer:{item['answer']}"
                documents.append(Document(page_content=combined_text, metadata={"source":filename}))
    splitter = RecursiveCharacterTextSplitter(chunk_size = 500, chunk_overlap = 50)
    chunks = splitter.split_documents(documents)

    print(f"--- Embedding {len(chunks)} QA pairs ---")

    vectorstore = Chroma.from_documents(
        documents=chunks,
        embedding=embeddings,
        persist_directory = DB_PATH,
        collection_name = "json_knowledge"
    )

    print("--- Knowledgebase Ready ---")
    return vectorstore