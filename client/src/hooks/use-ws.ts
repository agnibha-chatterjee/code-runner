import { useCallback, useEffect, useRef, useState } from "react"

interface IUseWSConfig {
  onMessage?: (data: string) => void
  initialMessage?: Record<string, any>
  maxRetries?: number
  retryInterval?: number
}

export function useWS(url: string, config?: IUseWSConfig) {
  const webSocketRef = useRef<WebSocket | null>(null)
  const [connected, setConnected] = useState(false)
  const [error, setError] = useState<Event | null>(null)
  const retryCountRef = useRef(0)

  const endpoint = url.split("/").pop()

  const {
    onMessage,
    initialMessage = {},
    maxRetries = 3,
    retryInterval = 500,
  } = config ?? {}

  const retryConnection = useCallback(
    function () {
      if (retryCountRef.current >= maxRetries) {
        console.error(
          `[WS] Max retries reached. Stopping reconnection attempts.`
        )
        return
      }

      const delay = retryInterval * Math.pow(2, retryCountRef.current)
      retryCountRef.current++

      console.log(`[WS] Reconnecting in ${delay}ms...`)

      setTimeout(() => {
        const connection = setupConnection()
        webSocketRef.current = connection
      }, delay)
    },
    [maxRetries, retryInterval]
  )

  const setupConnection = useCallback(
    function (): WebSocket {
      const connection = new WebSocket(url)

      connection.onopen = () => {
        if (retryCountRef.current > 0) {
          console.log(`[WS] Reconnected to endpoint -> ${endpoint}`)
          retryCountRef.current = 0
        } else {
          console.log(`[WS] Connected to endpoint -> ${endpoint}`)
        }

        setConnected(true)
      }

      connection.onclose = () => {
        console.log(`[WS] Disconnected from endpoint -> ${endpoint}`)
        setConnected(false)
        retryConnection()
      }

      connection.onerror = (error) => {
        console.error("[WS] Error", error)
        setError(error)
      }

      return connection
    },
    [url]
  )

  useEffect(() => {
    const connection = setupConnection()
    webSocketRef.current = connection

    return () => {
      connection.close()
      webSocketRef.current = null
    }
  }, [setupConnection])

  useEffect(() => {
    if (!connected) return

    webSocketRef.current!.onmessage = (event) => {
      if (onMessage) {
        onMessage(event.data)
      }
    }

    if (Object.keys(initialMessage).length > 0) {
      webSocketRef.current?.send(JSON.stringify(initialMessage))
    }

    return () => {
      webSocketRef.current!.onmessage = null
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
