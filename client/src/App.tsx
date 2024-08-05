import { useEffect, useRef, useState } from "react"
import { Terminal } from "./components/Terminal"
import { Editor } from "./components/Editor"

function App() {
  const [connected, setConnected] = useState(false)
  const [files, setFiles] = useState<string[]>([])
  const [selectedFile, setSelectedFile] = useState<string | null>(null)
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

    return () => {
      connection.close()
    }
  }, [])

  useEffect(() => {
    if (!connected || !socketRef.current) return

    socketRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data)

      if (data.type === "AllFiles") {
        setFiles(data.files)
      }
    }

    socketRef.current.send(JSON.stringify({ type: "AllFiles" }))
  }, [connected])

  return (
    <main>
      <section style={{ display: "flex", flexDirection: "row" }}>
        <div style={{ flexGrow: 0.5 }}>
          {files.map((file) => (
            <div key={file} style={{ margin: "5px 0 5px 0" }}>
              <button
                onClick={() => setSelectedFile(file)}
                style={{
                  background: "none",
                  border: "none",
                  color: "white",
                  cursor: "pointer",
                }}
              >
                {file}
              </button>
            </div>
          ))}
        </div>
        <section
          style={{ display: "flex", flexDirection: "column", flexGrow: 2 }}
        >
          <Editor socketRef={socketRef} selectedFile={selectedFile} />
          <Terminal />
        </section>
      </section>
    </main>
  )
}

export default App
