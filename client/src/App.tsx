import { useState } from "react"
import { Terminal } from "./components/Terminal"
import { Editor } from "./components/Editor"
import { FileExplorer } from "./components/FileExplorer"
import { useWS } from "./hooks/use-ws"

function App() {
  const [files, setFiles] = useState<Record<string, any>>({})
  const [selectedFile, setSelectedFile] = useState<string | null>(null)

  useWS("ws://127.0.0.1:3000/ws", {
    initialMessage: { type: "AllFiles" },
    onMessage: (data: string) => {
      const parsedData = JSON.parse(data)
      if (parsedData.type === "AllFiles") {
        setFiles(parsedData.files)
      }
    },
  })

  return (
    <main>
      <section style={{ display: "flex", flexDirection: "row" }}>
        <FileExplorer files={files} setSelectedFile={setSelectedFile} />
        <section
          style={{ display: "flex", flexDirection: "column", flexGrow: 1.75 }}
        >
          <Editor selectedFile={selectedFile} />
          <Terminal selectedFile={selectedFile} />
        </section>
      </section>
    </main>
  )
}

export default App
