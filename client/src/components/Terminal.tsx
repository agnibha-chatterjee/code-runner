import { Terminal as Xterm } from "@xterm/xterm"
import { Fragment, useEffect, useRef } from "react"
import "@xterm/xterm/css/xterm.css"

interface ITerminalProps {
  selectedFile: string | null
}

export function Terminal(props: ITerminalProps) {
  const terminalConnectionRef = useRef<WebSocket | null>(null)

  function runCode() {
    if (!props.selectedFile) return

    const extension = props.selectedFile.split(".").pop()

    terminalConnectionRef.current?.send("clear" + "\r")

    switch (extension) {
      case "js":
        terminalConnectionRef.current?.send("node " + props.selectedFile + "\r")
        break
      case "py":
        terminalConnectionRef.current?.send(
          "python3 " + props.selectedFile + "\r"
        )
        break
      default:
        terminalConnectionRef.current?.send(
          "echo 'Unsupported file type'" + "\r"
        )
    }
  }

  useEffect(() => {
    const connection = new WebSocket("ws://127.0.0.1:3000/terminal")
    terminalConnectionRef.current = connection

    connection.onopen = () => {
      console.log("Connected to Terminal")
    }

    connection.onclose = () => {
      console.log("Disconnected from Terminal")
    }

    const newTerminal = new Xterm()
    newTerminal.open(document.getElementById("terminal")!)

    const onDataListener = newTerminal.onData((data) => {
      connection.send(data)
    })

    connection.onmessage = (event) => {
      newTerminal.write(event.data)
    }

    return () => {
      newTerminal.dispose()
      onDataListener.dispose()
      connection.close()
    }
  }, [])

  return (
    <Fragment>
      <button onClick={runCode}>Run</button>
      <div id="terminal"></div>
    </Fragment>
  )
}
