import { Terminal as Xterm } from "@xterm/xterm"
import { Fragment, useEffect, useRef } from "react"
import "@xterm/xterm/css/xterm.css"
import { useWS } from "../hooks/use-ws"

interface ITerminalProps {
  selectedFile: string | null
}

export function Terminal(props: ITerminalProps) {
  const xTermRef = useRef<Xterm | null>(null)

  const { sendMessage } = useWS("ws://127.0.0.1:3000/terminal", {
    onMessage: (data) => {
      xTermRef.current!.write(data)
    },
  })

  useEffect(() => {
    const newTerminal = new Xterm()
    xTermRef.current = newTerminal
    newTerminal.open(document.getElementById("terminal")!)

    const onDataListener = newTerminal.onData((data) => {
      sendMessage(data)
    })

    return () => {
      onDataListener.dispose()
    }
  }, [])

  function runCode() {
    if (!props.selectedFile) return

    const extension = props.selectedFile.split(".").pop()

    sendMessage("clear\r")

    switch (extension) {
      case "js":
        sendMessage("node " + props.selectedFile + "\r")
        break
      case "py":
        sendMessage("python3 " + props.selectedFile + "\r")
        break
      default:
        sendMessage("echo 'Unsupported file type'\r")
    }
  }

  return (
    <Fragment>
      <button onClick={runCode}>Run</button>
      <div id="terminal"></div>
    </Fragment>
  )
}
