import * as React from "react"
import { type ToastProps } from "@/components/ui/toast"

export function useToast() {
  const [toasts, setToasts] = React.useState<ToastProps[]>([])

  const toast = React.useCallback(
    ({ title, description, variant = "default" }: { title: string; description: string; variant?: "default" | "destructive" }) => {
      const id = Math.random().toString(36).substring(2, 9)
      const newToast = { id, title, description, variant }
      setToasts((prev) => [...prev, newToast])

      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id))
      }, 5000)
    },
    []
  )

  return { toast, toasts }
} 