import * as React from "react"

const RadioGroup = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <div className={className}>
      {props.children}
    </div>
  )
})
RadioGroup.displayName = "RadioGroup"

const RadioGroupItem = React.forwardRef(({ className, value, checked, onValueChange, ...props }, ref) => {
  return (
    <button
      type="button"
      role="radio"
      ref={ref}
      className={`
        relative h-4 w-4 rounded-full border border-input 
        ${checked ? "border-primary" : ""}
        ${className || ""}
      `}
      aria-checked={checked}
      onClick={() => onValueChange?.(value)}
      data-state={checked ? "checked" : "unchecked"}
      {...props}
    >
      {checked && (
        <div className="h-2 w-2 rounded-full bg-primary m-0.5"></div>
      )}
    </button>
  )
})
RadioGroupItem.displayName = "RadioGroupItem"

export { RadioGroup, RadioGroupItem }
export default RadioGroup