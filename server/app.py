import asyncio
import json
import os
import pty
import select
from subprocess import PIPE

from fastapi import FastAPI, WebSocket
from watchfiles import awatch

app = FastAPI()

FILE_WATCHER_RUNNING = False

USR_PATH = os.getcwd() + "/playground"


async def setup_file_watcher(websocket: WebSocket):
    global FILE_WATCHER_RUNNING
    if not FILE_WATCHER_RUNNING:
        async for changes in awatch("."):
            print(changes)
            files = os.listdir(".")
            await websocket.send_json({"files": files, "type": "AllFiles"})
            return

    FILE_WATCHER_RUNNING = True


def get_dir_tree(path=USR_PATH):
    tree = {}

    def build_tree(current_path, curr_tree):
        contents = os.listdir(current_path)
        for file in contents:
            file_path = os.path.join(current_path, file)
            if os.path.isdir(file_path):
                curr_tree[file] = {}
                build_tree(file_path, curr_tree[file])
            else:
                curr_tree[file] = None

    build_tree(path, tree)
    return tree


@app.get("/")
def health_check():
    return {"status": "ok"}


@app.get("/files")
def list_files():
    files = os.listdir(".")
    return {"files": files}


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()

    while True:
        req = await websocket.receive_json()
        print(req)
        match req["type"]:
            case "AllFiles":
                dir_tree = get_dir_tree()
                resp = {"files": dir_tree, "type": "AllFiles"}
                await websocket.send_json(resp)

            case "FetchFile":
                selected_file = req["file"]
                file_path = USR_PATH + f"/{selected_file}"
                with open(file_path, "r") as f:
                    content = f.read()
                await websocket.send_json({"content": content, "type": "FetchFile"})

            case "SaveFile":
                selected_file = req["file"]
                file_path = USR_PATH + f"/{selected_file}"
                content = req["content"]
                with open(file_path, "w") as f:
                    f.write(content)
                await websocket.send_json({"type": "SaveFile"})


@app.websocket("/terminal")
async def websocket_terminal(websocket: WebSocket):
    await websocket.accept()

    master, slave = pty.openpty()

    pid = os.fork()
    if pid == 0:
        os.close(master)
        os.dup2(slave, 0)
        os.dup2(slave, 1)
        os.dup2(slave, 2)

        os.chdir(USR_PATH)
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
                data = await asyncio.wait_for(websocket.receive_text(), timeout=0.01)
                encoded_data = data.encode()
                os.write(master, encoded_data)
            except asyncio.TimeoutError:
                pass
    finally:
        os.close(master)
        os.kill(pid, 9)
