interface IFileExplorerProps {
  files: Record<string, string>
  setSelectedFile: (file: string) => void
}

export function FileExplorer(props: IFileExplorerProps) {
  const { files, setSelectedFile } = props
  return (
    <div style={{ flexGrow: 0.75 }}>
      {Object.keys(files).map((file) => {
        if (files[file] !== null) {
          return (
            <div>
              <span>{file}</span>
              <div style={{ marginLeft: 10 }}>
                <FileExplorer
                  files={files[file]}
                  setSelectedFile={setSelectedFile}
                />
              </div>
            </div>
          )
        }

        return (
          <div key={file} style={{ margin: "5px 0 5px 0" }}>
            <button
              onClick={() => setSelectedFile(file)}
              style={{
                background: "none",
                border: "none",
                color: "white",
                cursor: "pointer",
              }}
            >
              {file}
            </button>
          </div>
        )
      })}
    </div>
  )
}
