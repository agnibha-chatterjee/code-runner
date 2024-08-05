import { Terminal as Xterm } from "@xterm/xterm"
import { useEffect, useRef, useState } from "react"
import "@xterm/xterm/css/xterm.css"

export function Terminal() {
  const terminalRef = useRef<Xterm | null>(null)
  const [input, setInput] = useState("")

  useEffect(() => {
    const newTerminal = new Xterm()
    newTerminal.open(document.getElementById("terminal")!)
    terminalRef.current = newTerminal

    const onDataListener = terminalRef.current.onData((data) => {
      const code = data.charCodeAt(0)
      if (code === 13 && input.length > 0) {
        terminalRef.current?.write("\r\nYou typed: '" + input + "'\r\n")
        terminalRef.current?.write("echo> ")
        setInput("")
      } else if (code < 32 || code === 127) {
        console.log("Control Key", code)
        return
      } else {
        terminalRef.current?.write(data)
        setInput(input + data)
      }
    })

    return () => {
      if (!terminalRef.current) return
      terminalRef.current.dispose()
      onDataListener.dispose()
    }
  }, [])

  return <div id="terminal"></div>
}
