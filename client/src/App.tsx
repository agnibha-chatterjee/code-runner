import { useEffect, useRef, useState } from "react"
import { Terminal } from "./components/Terminal"

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
    <main>
      <h1>Websocket Terminal</h1>
      {connected && <Terminal socketRef={socketRef} />}
    </main>
  )
}

export default App
