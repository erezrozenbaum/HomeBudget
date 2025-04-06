import React from "react";
import { Check } from "lucide-react";

const Checkbox = React.forwardRef(({ className, checked, onCheckedChange, disabled, ...props }, ref) => {
  const [isChecked, setIsChecked] = React.useState(checked || false);
  
  React.useEffect(() => {
    setIsChecked(checked || false);
  }, [checked]);
  
  const handleClick = () => {
    if (disabled) return;
    
    const newValue = !isChecked;
    setIsChecked(newValue);
    
    if (onCheckedChange) {
      onCheckedChange(newValue);
    }
  };
  
  return (
    <div
      ref={ref}
      role="checkbox"
      aria-checked={isChecked}
      tabIndex={disabled ? -1 : 0}
      className={`relative flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border ${
        disabled 
          ? "border-gray-600 bg-gray-700/50 cursor-not-allowed opacity-50" 
          : isChecked 
            ? "border-blue-600 bg-blue-600 cursor-pointer" 
            : "border-gray-600 bg-gray-800 cursor-pointer hover:bg-gray-700"
      } ${className || ""}`}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleClick();
        }
      }}
      {...props}
    >
      {isChecked && (
        <Check className="h-3 w-3 text-white" />
      )}
    </div>
  );
});

Checkbox.displayName = "Checkbox";

export { Checkbox };
export default Checkbox;