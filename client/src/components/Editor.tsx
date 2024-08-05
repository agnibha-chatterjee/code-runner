import CodeMirror from "@uiw/react-codemirror"
import { useCallback, useState } from "react"
import { javascript } from "@codemirror/lang-javascript"
import { python } from "@codemirror/lang-python"

export function Editor() {
  const [value, setValue] = useState("console.log('hello world!');")

  const onChange = useCallback((val: string) => {
    setValue(val)
  }, [])

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
