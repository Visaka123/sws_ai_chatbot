import os

from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import Chroma
from langchain_community.embeddings import HuggingFaceEmbeddings

print("Loading company documents...")

all_docs = []

DOCS_PATH = "documents"

for file in os.listdir(DOCS_PATH):

    if file.endswith(".pdf"):

        loader = PyPDFLoader(f"{DOCS_PATH}/{file}")

        docs = loader.load()

        for index, doc in enumerate(docs):

            doc.metadata["source"] = file
            doc.metadata["chunk_id"] = index
            doc.metadata["page"] = doc.metadata.get("page", 0)

        all_docs.extend(docs)

print(f"Loaded {len(all_docs)} pages")

splitter = RecursiveCharacterTextSplitter(
    chunk_size=500,
    chunk_overlap=50
)

chunks = splitter.split_documents(all_docs)

print(f"Created {len(chunks)} chunks")

embedding = HuggingFaceEmbeddings(
    model_name="sentence-transformers/all-MiniLM-L6-v2"
)

db = Chroma.from_documents(
    chunks,
    embedding,
    persist_directory="chroma_db"
)

db.persist()

print("Embeddings stored successfully")

# Retrieval Test

query = "What is the leave policy?"

results = db.similarity_search(query, k=3)

print("\nTop Retrieval Results:\n")

for r in results:

    print(r.page_content[:300])

    print(r.metadata)

    print("------------------------------------------------")
