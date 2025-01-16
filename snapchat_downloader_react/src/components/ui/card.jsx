const Card = ({ className, ...props }) => (
    <div
      className={`bg-white rounded-lg border shadow-sm ${className}`}
      {...props}
    />
  )
  
  const CardHeader = ({ className, ...props }) => (
    <div
      className={`flex flex-col space-y-1.5 p-6 ${className}`}
      {...props}
    />
  )
  
  const CardContent = ({ className, ...props }) => (
    <div className={`p-6 pt-0 ${className}`} {...props} />
  )
  
  export { Card, CardHeader, CardContent }