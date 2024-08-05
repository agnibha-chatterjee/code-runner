import CodeMirror from "@uiw/react-codemirror"
import { useCallback, useEffect, useState } from "react"
import { javascript } from "@codemirror/lang-javascript"
import { python } from "@codemirror/lang-python"

interface IEditorProps {
  socketRef: React.MutableRefObject<WebSocket | null>
  selectedFile: string | null
}

function debounce<F extends (...args: Parameters<F>) => ReturnType<F>>(
  func: F,
  waitFor: number
): (...args: Parameters<F>) => void {
  let timeout: ReturnType<typeof setTimeout>

  return (...args: Parameters<F>): void => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), waitFor)
  }
}

export function Editor(props: IEditorProps) {
  const { socketRef, selectedFile } = props

  const [value, setValue] = useState("console.log('hello world!');")

  const debouncedSave = debounce(function (file: string, updatedValue: string) {
    const msg = {
      type: "SaveFile",
      file,
      content: updatedValue,
    }

    console.log("Sending message", msg)
    socketRef.current?.send(JSON.stringify(msg))
  }, 1250)

  const onChange = useCallback(
    (val: string) => {
      setValue(val)
      debouncedSave(selectedFile!, val)
    },
    [selectedFile]
  )

  const fetchFile = function () {
    if (!selectedFile) return
    socketRef.current?.send(
      JSON.stringify({ type: "FetchFile", file: selectedFile })
    )

    socketRef.current!.onmessage = (event) => {
      const data = JSON.parse(event.data)

      if (data.type === "FetchFile") {
        console.log(data.content)
        setValue(data.content)
      }
    }
  }

  useEffect(() => {
    if (!selectedFile) return

    fetchFile()
  }, [selectedFile])

  return (
    <CodeMirror
      theme="dark"
      value={value}
      height="600px"
      extensions={[javascript({ jsx: true })]}
      onChange={onChange}
    />
  )
}
