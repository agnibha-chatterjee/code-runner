import { useEffect, useRef } from "react"
import { Terminal } from "./components/Terminal"

function App() {
  const socketRef = useRef<WebSocket>()

  useEffect(() => {
    const connection = new WebSocket("ws://127.0.0.1:8000/ws")
    socketRef.current = connection

    connection.onopen = () => {
      console.log("Connected to the server")
    }

    connection.onclose = () => {
      console.log("Disconnected from the server")
    }
  }, [])

  return (
    <main>
      <h1>Websocket Terminal</h1>
      <Terminal />
    </main>
  )
}

export default App
