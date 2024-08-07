import { useCallback, useEffect, useRef, useState } from "react"

interface IUseWSConfig {
  onMessage?: <T extends Record<string, any>>(parsedData: T) => void
  parseResponseAsJSON?: boolean
  initialMessage?: Record<string, any>
}

export function useWS(url: string, config?: IUseWSConfig) {
  const webSocketRef = useRef<WebSocket | null>(null)
  const [connected, setConnected] = useState(false)
  const [error, setError] = useState<Event | null>(null)
  const [cacheConnection, setCacheConnection] = useState<
    Record<string, WebSocket>
  >({})

  const endpoint = url.split("/").pop()

  const {
    onMessage,
    parseResponseAsJSON = false,
    initialMessage = {},
  } = config ?? {}

  useEffect(() => {
    if (cacheConnection[url]) {
      webSocketRef.current = cacheConnection[url]
      setConnected(true)
      return
    }

    const connection = new WebSocket(url)

    connection.onopen = () => {
      console.log(`[WS] Connected to endpoint -> ${url.split("/").pop()}`)
      setConnected(true)
      setCacheConnection((prev) => ({ ...prev, [url]: connection }))
    }

    connection.onclose = () => {
      console.log(`[WS] Disconnected from endpoint -> ${endpoint}`)
      setConnected(false)
      setCacheConnection((prev) => {
        delete prev[url]
        return { ...prev }
      })
    }

    connection.onerror = (error) => {
      console.error("[WS] Error", error)
      setError(error)
    }

    webSocketRef.current = connection

    return () => {
      connection.close()
    }
  }, [url])

  useEffect(() => {
    if (!connected) return

    webSocketRef.current!.onmessage = (event) => {
      if (onMessage) {
        onMessage(parseResponseAsJSON ? JSON.parse(event.data) : event.data)
      }
    }

    if (Object.keys(initialMessage).length > 0) {
      webSocketRef.current?.send(JSON.stringify(initialMessage))
    }
  }, [connected])

  const sendJSONMessage = useCallback((message: Record<string, any>) => {
    if (!webSocketRef.current) return
    webSocketRef.current.send(JSON.stringify(message))
  }, [])

  const sendMessage = useCallback((message: string) => {
    if (!webSocketRef.current) return
    webSocketRef.current.send(message)
  }, [])

  return {
    connected,
    rawWSConnection: webSocketRef.current,
    error,
    sendJSONMessage,
    sendMessage,
  }
}
