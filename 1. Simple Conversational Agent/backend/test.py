import asyncio
import websockets

async def test():
    uri = "ws://127.0.0.1:8000/ws/test123"
    async with websockets.connect(uri) as websocket:
        await websocket.send("Xin chào")
        reply = await websocket.recv()
        print("Server trả lời:", reply)

asyncio.run(test())
