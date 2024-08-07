import { useEffect, useState } from "react"
import CodeMirror from "@uiw/react-codemirror"
import { javascript } from "@codemirror/lang-javascript"
import { python } from "@codemirror/lang-python"
import { autocompletion, CompletionContext } from "@codemirror/autocomplete"
import { debounce } from "../utils"
import { useWS } from "../hooks/use-ws"

interface IEditorProps {
  selectedFile: string | null
}

function myCompletions(context: CompletionContext) {
  const word = context.matchBefore(/\w*/)
  if (!word) return null
  if (word.from == word.to && !context.explicit) return null
  return {
    from: word.from,
    options: [
      { label: "match", type: "keyword" },
      { label: "hello", type: "variable", info: "(World)" },
      { label: "magic", type: "text", apply: "⠁⭒*.✩.*⭒⠁", detail: "macro" },
    ],
  }
}

export function Editor(props: IEditorProps) {
  const { selectedFile } = props
  const [value, setValue] = useState("")

  const { sendJSONMessage } = useWS("ws://127.0.0.1:3000/ws", {
    onMessage: (data: string) => {
      const parsedData = JSON.parse(data)
      if (parsedData.type === "FetchFile") {
        setValue(parsedData.content)
      }
    },
  })

  useEffect(() => {
    if (!selectedFile) return

    const msg = {
      type: "FetchFile",
      file: selectedFile,
    }

    sendJSONMessage(msg)
  }, [selectedFile])

  const debouncedSave = debounce(function (file: string, updatedValue: string) {
    const msg = {
      type: "SaveFile",
      file,
      content: updatedValue,
    }

    sendJSONMessage(msg)
  }, 1250)

  const onChange = (val: string) => {
    setValue(val)
    debouncedSave(selectedFile!, val)
  }

  return (
    <CodeMirror
      theme="dark"
      value={value}
      height="600px"
      extensions={[
        javascript({ jsx: true, typescript: true }),
        python(),
        autocompletion({ override: [myCompletions] }),
      ]}
      onChange={onChange}
    />
  )
}
