import os
from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_community.chat_message_histories import ChatMessageHistory
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.runnables.history import RunnableWithMessageHistory

load_dotenv()

# Take the OpenAI API key from environment variables
os.environ["GOOGLE_API_KEY"] = os.getenv("GOOGLE_API_KEY")

class LLM():
    # Init the LLM and chat history store
    def __init__(self):
        self.llm = ChatGoogleGenerativeAI(model="models/gemini-2.5-flash", max_tokens=1000, temperature=0)
        self.store = {}

    # Function to get chat history for a session
    def get_chat_history(self, session_id: str):
        if session_id not in self.store:
            self.store[session_id] = ChatMessageHistory()
        return self.store[session_id]

    # Function to create a prompt for the LLM
    def create_prompt(self):
        return ChatPromptTemplate.from_messages([
            ("system", "You are a helpful AI assistant."),
            MessagesPlaceholder(variable_name="history"),
            ("user", "{input}"),
        ])

    # Function to create a chain for the LLM
    def create_chain(self, prompt):
        return prompt | self.llm
    
    # Function to create a chain with history for the LLM
    def create_chain_with_history(self, chain):
        return RunnableWithMessageHistory(
            chain,
            self.get_chat_history,    
            input_messages_key="input",
            history_messages_key="history",
        )