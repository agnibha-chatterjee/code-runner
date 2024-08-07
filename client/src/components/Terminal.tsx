import { Terminal as Xterm } from "@xterm/xterm"
import { Fragment, useEffect, useRef } from "react"
import "@xterm/xterm/css/xterm.css"

export function Terminal() {
  const terminalConnectionRef = useRef<WebSocket | null>(null)

  function runCode() {
    terminalConnectionRef.current?.send("clear" + "\r")
    terminalConnectionRef.current?.send("node test1.js" + "\r")
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
