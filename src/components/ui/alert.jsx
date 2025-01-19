const Alert = ({ className, variant = "default", ...props }) => (
    <div
      role="alert"
      className={`
        rounded-lg border p-4
        ${variant === "destructive" ? "border-red-500 bg-red-50 text-red-700" : "border-gray-200 bg-white"}
        ${className}
      `}
      {...props}
    />
  )
  
  const AlertDescription = ({ className, ...props }) => (
    <div
      className={`text-sm [&_p]:leading-relaxed ${className}`}
      {...props}
    />
  )
  
  export { Alert, AlertDescription }