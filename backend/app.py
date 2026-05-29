import os

from dotenv import load_dotenv

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from langchain_community.vectorstores import Chroma
from langchain_huggingface import HuggingFaceEmbeddings

from langchain_groq import ChatGroq

load_dotenv()

app = FastAPI()

# CORS

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# GROQ LLM

llm = ChatGroq(
    groq_api_key=os.getenv("GROQ_API_KEY"),
    model="meta-llama/llama-4-scout-17b-16e-instruct",
    temperature=0
)

# Embeddings

embedding = HuggingFaceEmbeddings(
    model_name="sentence-transformers/all-MiniLM-L6-v2"
)

# Vector DB

# Update this path in your backend/app.py
db = Chroma(
    persist_directory=os.path.join("backend", "chroma_db"),
    embedding_function=embedding
)

class ChatRequest(BaseModel):
    question: str

@app.get("/")
def home():

    return {
        "message": "SWS AI RAG Chatbot API Running"
    }

@app.post("/api/chat")
def chat(req: ChatRequest):

    try:

        if not req.question.strip():

            return {
                "answer": "Question cannot be empty.",
                "sources": []
            }

        # RETRIEVE DOCUMENTS

        docs = db.similarity_search(
            req.question,
            k=3
        )

        # CONTEXT BUILDING

        context = "\n\n".join([
            doc.page_content
            for doc in docs
        ])

        # SOURCES

        sources = []

        for doc in docs:

            sources.append({
                "document": doc.metadata.get("source"),
                "page": doc.metadata.get("page")
            })

        unique_sources = []

        seen = set()

        for s in sources:

            key = (s["document"], s["page"])

            if key not in seen:

                unique_sources.append(s)

                seen.add(key)

        # PROMPT

        prompt = f"""
You are an internal company assistant for SWS AI.

Rules:
- Answer ONLY from the provided context
- Do not hallucinate
- Keep answers concise and professional
- If the answer is unavailable, respond exactly:
'I don't have that information in the company documents.'

Context:
{context}

Question:
{req.question}

Answer:
"""

        # GROQ RESPONSE

        response = llm.invoke(prompt)

        answer = response.content

        return {
            "answer": answer,
            "sources": unique_sources
        }

    except Exception as e:

        return {
            "answer": str(e),
            "sources": []
        }