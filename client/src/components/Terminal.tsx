import { Terminal as Xterm } from "@xterm/xterm"
import { useEffect } from "react"
import "@xterm/xterm/css/xterm.css"

interface ITerminalProps {
  socketRef: React.MutableRefObject<WebSocket | null>
}

export function Terminal(props: ITerminalProps) {
  const { socketRef: { current: socket } = {} } = props

  useEffect(() => {
    if (!socket) return

    const newTerminal = new Xterm()
    newTerminal.open(document.getElementById("terminal")!)

    const onDataListener = newTerminal.onData((data) => {
      const msg = { type: "ShellCommand", data }
      socket.send(data)
    })

    socket!.onmessage = (event) => {
      newTerminal.write(event.data)
    }

    return () => {
      newTerminal.dispose()
      onDataListener.dispose()
    }
  }, [])

  return <div id="terminal"></div>
}
