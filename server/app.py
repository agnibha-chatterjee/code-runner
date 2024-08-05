import asyncio
import json
import os
import pty
import select
from contextlib import asynccontextmanager
from subprocess import PIPE
from typing import List

from fastapi import Depends, FastAPI, WebSocket, WebSocketDisconnect

app = FastAPI()


@app.get("/")
def health_check():
    return {"status": "ok"}


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()

    master, slave = pty.openpty()

    pid = os.fork()
    if pid == 0:
        os.close(master)
        os.dup2(slave, 0)
        os.dup2(slave, 1)
        os.dup2(slave, 2)
        os.execvp("zsh", ["zsh"])
    else:
        os.close(slave)

    try:
        while True:
            r, _, _ = select.select([master], [], [], 0.1)
            if r:
                data = os.read(master, 1024)
                if data:
                    await websocket.send_text(data.decode())

            try:
                data = await asyncio.wait_for(websocket.receive_text(), timeout=0.1)
                os.write(master, data.encode())
            except asyncio.TimeoutError:
                pass
    finally:
        os.close(master)
        os.kill(pid, 9)
