import { Terminal as Xterm } from "@xterm/xterm"
import { useEffect, useRef } from "react"

export function Terminal() {
  const terminalRef = useRef<Xterm>()

  useEffect(() => {
    const newTerminal = new Xterm()
    newTerminal.open(document.getElementById("terminal")!)
    terminalRef.current = newTerminal
  }, [])

  return <div id="terminal"></div>
}
