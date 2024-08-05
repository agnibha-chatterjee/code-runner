import { useEffect, useRef, useState } from "react"
import { Terminal } from "./components/Terminal"
import { Editor } from "./components/Editor"

function App() {
  const [connected, setConnected] = useState(false)
  const socketRef = useRef<WebSocket | null>(null)

  useEffect(() => {
    const connection = new WebSocket("ws://127.0.0.1:3000/ws")
    socketRef.current = connection

    connection.onopen = () => {
      console.log("Connected to the server")
      setConnected(true)
    }

    connection.onclose = () => {
      console.log("Disconnected from the server")
      setConnected(false)
    }
  }, [])

  return (
    <main
      style={{
        margin: "0 20px 0 20px",
      }}
    >
      <Editor />
      {connected && <Terminal socketRef={socketRef} />}
    </main>
  )
}

export default App
