from llm import LLM
from fastapi import FastAPI, WebSocket, WebSocketDisconnect

app = FastAPI()
llm = LLM()

# Make a websocket endpoint for the LLM
@app.websocket("/ws/{session_id}")
async def websocket_endpoint(websocket: WebSocket, session_id: str):
    await websocket.accept()
    try:
        while True:
            # Receive input from the client
            input_text = await websocket.receive_text()

            # Get chat history, create prompt, chain, and chain with history
            chat_history = llm.get_chat_history(session_id)
            prompt = llm.create_prompt()
            chain = llm.create_chain(prompt)
            chain_with_history = llm.create_chain_with_history(chain)

            chat_history.add_user_message(input_text)
            
            # Invoke the chain with the input and session ID
            response = await chain_with_history.ainvoke(
                {"input": input_text},
                config={"configurable": {"session_id": session_id}}
            )

            await websocket.send_text(response.content)

    except WebSocketDisconnect:
        print(f"Client {session_id} disconnected")

