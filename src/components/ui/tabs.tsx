/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-object-type */
import * as React from "react"

interface TabsProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
  onValueChange: (value: string) => void;
}

const Tabs = React.forwardRef<
  HTMLDivElement,
  TabsProps
>(({ className, value, onValueChange, ...props }, ref) => (
  <div
    ref={ref}
    className={`w-full ${className || ""}`}
    {...props}
  />
))
Tabs.displayName = "Tabs"

interface TabsListProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Container for tab triggers */
}

const TabsList = React.forwardRef<
  HTMLDivElement,
  TabsListProps
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={`inline-flex items-center justify-center rounded-md bg-gray-100 p-1 ${className || ""}`}
    {...props}
  />
))
TabsList.displayName = "TabsList"

interface TabsTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
}

const TabsTrigger = React.forwardRef<
  HTMLButtonElement,
  TabsTriggerProps
>(({ className, value, ...props }, ref) => {
  // Get the current value from the nearest Tabs component
  const context = React.useContext(TabsContext);
  const isActive = context?.value === value;
  
  return (
    <button
      ref={ref}
      className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${
        isActive 
          ? "bg-white text-blue-600 shadow-sm" 
          : "text-gray-600 hover:text-blue-600"
      } ${className || ""}`}
      onClick={() => context?.onValueChange(value)}
      {...props}
    />
  )
})
TabsTrigger.displayName = "TabsTrigger"

interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
}

const TabsContent = React.forwardRef<
  HTMLDivElement,
  TabsContentProps
>(({ className, value, ...props }, ref) => {
  // Get the current value from the nearest Tabs component
  const context = React.useContext(TabsContext);
  const isActive = context?.value === value;
  
  if (!isActive) return null;
  
  return (
    <div
      ref={ref}
      className={`mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${className || ""}`}
      {...props}
    />
  )
})
TabsContent.displayName = "TabsContent"

// Create a context to share the active tab value
interface TabsContextValue {
  value: string;
  onValueChange: (value: string) => void;
}

const TabsContext = React.createContext<TabsContextValue | undefined>(undefined);

// Wrap the Tabs component to provide context
const TabsWithContext = React.forwardRef<
  HTMLDivElement,
  TabsProps
>((props, ref) => {
  return (
    <TabsContext.Provider value={{ value: props.value, onValueChange: props.onValueChange }}>
      <Tabs ref={ref} {...props} />
    </TabsContext.Provider>
  )
})
TabsWithContext.displayName = "Tabs"

export { TabsWithContext as Tabs, TabsList, TabsTrigger, TabsContent } 