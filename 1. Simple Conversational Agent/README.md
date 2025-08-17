
# 1. Simple Conversational Agent

<img width="1862" height="957" alt="image" src="https://github.com/user-attachments/assets/cc7d7d78-d351-4e45-8c83-fba1b2767eb3" />

## 📖 Overview

This project demonstrates how to build a **context-aware conversational agent** using the **Gemini 2.5 Flash** language model.
Unlike many chatbots that forget past messages, this agent maintains **chat history in memory** to provide coherent and natural multi-turn conversations.

💡 *Note: No chat history is persisted to a database (e.g., Prisma/Neon); memory is reset on backend restart.*


## 📂 Project Structure

```bash
├── backend/
│   ├── app.py           # FastAPI backend with WebSocket endpoint for real-time chat
│   ├── llm.py           # LLM wrapper + in-memory chat history management
│   ├── requirements.txt # Python dependencies
│   ├── Dockerfile       # Containerization support
│   └── test.py          # Backend tests
│
└── frontend/
    ├── app/             # Next.js app (pages, layouts, API routes)
    ├── components/      # React components (chat UI, auth, etc.)
    ├── hooks/           # Custom React hooks (WebSocket, toasts)
    ├── lib/             # Utility functions (auth, websocket client)
    ├── prisma/          # Prisma schema (⚠️ not used for chat history)
    ├── public/          # Static assets
    ├── scripts/         # Database scripts (⚠️ not used for chat history)
    └── ...              # Config files & build artifacts
```



## ✨ Key Features

* **🤖 Language Model:** Gemini 2.5 Flash for conversational AI.
* **🧠 Context Awareness:** Maintains chat history per session (in memory).
* **⚡ Real-Time:** WebSocket communication with FastAPI backend.
* **💻 Modern Frontend:** Next.js + React chat interface.
* **📦 Lightweight:** No database integration for chat logs.


## ⚙️ How It Works

1. **Session Management** → Each chat session has a unique `session_id`.
2. **In-Memory Chat History** → User and AI messages stored in `chat_history[session_id]`.
3. **Prompt Construction** → System instructions + history + latest user input.
4. **AI Response** → Gemini 2.5 Flash generates context-aware replies.
5. **Frontend** → Next.js UI communicates with backend via WebSocket.


## 🎯 Motivation

Most chatbots fail to maintain **context**, leading to broken or repetitive interactions.
This project improves **conversation flow** by keeping session history, making responses feel more natural.

## 🔧 Extensibility

* 🔄 **Switch LLMs:** Replace Gemini with another model.
* 💾 **Persistent Storage:** Connect Prisma/Neon for saving chats.
* 🎨 **Custom Prompts:** Adapt for customer support, sales, education, etc.

## ⚠️ Limitations

* **Ephemeral History** → Lost if backend restarts.
* **No Chat DB** → Prisma/Neon only for auth & user data (not conversations).

## 🚀 Getting Started

### 1️⃣ Install Dependencies

```bash
# Backend
pip install -r requirements.txt

# Frontend
npm install
```

### 2️⃣ Set Up API Keys & Config

Create a `.env` file in **backend** and **frontend**.

```bash
# Backend
GOOGLE_API_KEY=xxx   # https://ai.google.dev/gemini-api/docs

# Frontend
DATABASE_URL=xxx     # https://console.neon.tech/
NEXTAUTH_SECRET=xxx  # https://generate-secret.vercel.app/32
NEXTAUTH_URL="http://localhost:3000"

# Google OAuth (from Google Cloud Console)
GOOGLE_CLIENT_ID=xxx
GOOGLE_CLIENT_SECRET=xxx

# WebSocket API
NEXT_PUBLIC_FASTAPI_URL="ws://127.0.0.1:8000"
```

### 3️⃣ Run the Applications

```bash
# Backend (FastAPI)
uvicorn app:app --host 0.0.0.0 --port 8000

# Frontend (Next.js)
npm run dev
```

### 4️⃣ Start Chatting 🎉

Open `http://localhost:3000` in your browser and chat with the AI agent!

## 📌 Notes

This repo is a **foundation** for building more advanced conversational systems.
You can extend it with:

* Persistent chat history
* RAG (Retrieval-Augmented Generation)
* Sentiment analysis
* Task automation
