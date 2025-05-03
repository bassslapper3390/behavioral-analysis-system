import * as React from "react"

interface TabsProps {
  value: string
  onValueChange: (value: string) => void
  className?: string
  children: React.ReactNode
}

export function Tabs({ value, onValueChange, className, children }: TabsProps) {
  return (
    <div className={className}>{children}</div>
  )
}

interface TabsListProps {
  className?: string
  children: React.ReactNode
}

export function TabsList({ className, children }: TabsListProps) {
  return (
    <div className={`flex border-b ${className ?? ""}`}>{children}</div>
  )
}

interface TabsTriggerProps {
  value: string
  children: React.ReactNode
  className?: string
}

export function TabsTrigger({ value, children, className }: TabsTriggerProps) {
  // This is a dummy component for API compatibility; actual logic is handled in parent
  return (
    <button type="button" className={`px-4 py-2 font-medium border-b-2 border-transparent focus:outline-none focus:border-blue-500 data-[state=active]:border-blue-500 data-[state=active]:text-blue-600 ${className ?? ""}`}
      data-value={value}
    >
      {children}
    </button>
  )
}

interface TabsContentProps {
  value: string
  children: React.ReactNode
  className?: string
}

export function TabsContent({ value, children, className }: TabsContentProps) {
  // This is a dummy component for API compatibility; actual logic is handled in parent
  return (
    <div className={className}>{children}</div>
  )
} 