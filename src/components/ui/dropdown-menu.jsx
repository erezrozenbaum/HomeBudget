import React from "react";
import { Check, ChevronDown } from "lucide-react";

const DropdownMenu = ({ children }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  return (
    <div className="relative inline-block text-left">
      {React.Children.map(children, child => {
        if (child.type === DropdownMenuTrigger) {
          return React.cloneElement(child, {
            onClick: () => setIsOpen(!isOpen)
          });
        }
        if (child.type === DropdownMenuContent) {
          return isOpen && React.cloneElement(child);
        }
        return child;
      })}
    </div>
  );
};

const DropdownMenuTrigger = ({ children, asChild, className, onClick }) => {
  if (asChild) {
    return React.cloneElement(children, { onClick });
  }
  return (
    <button
      className={className}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

const DropdownMenuContent = ({ children, className = "" }) => {
  return (
    <div className={`absolute z-50 mt-2 rounded-md shadow-lg ${className}`}>
      <div className="rounded-md ring-1 ring-black ring-opacity-5 p-1">
        {children}
      </div>
    </div>
  );
};

const DropdownMenuLabel = ({ children, className = "" }) => {
  return (
    <div className={`px-3 py-2 text-sm font-medium ${className}`}>
      {children}
    </div>
  );
};

const DropdownMenuSeparator = ({ className = "" }) => {
  return <div className={`my-1 h-px ${className}`} />;
};

const DropdownMenuCheckboxItem = ({ children, checked, onCheckedChange, className = "" }) => {
  return (
    <button
      className={`flex items-center w-full px-3 py-2 text-sm rounded hover:bg-gray-100 ${className}`}
      onClick={() => onCheckedChange(!checked)}
    >
      <div className="flex items-center flex-1">
        <div className={`w-4 h-4 mr-3 flex items-center justify-center rounded border ${checked ? 'bg-blue-600 border-blue-600' : 'border-gray-500'}`}>
          {checked && <Check className="h-3 w-3 text-white" />}
        </div>
        {children}
      </div>
    </button>
  );
};

const DropdownMenuItem = ({ children, className = "", onClick }) => {
  return (
    <button
      className={`flex items-center w-full px-3 py-2 text-sm rounded hover:bg-gray-100 ${className}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem
};

// Add default export of the main component
export default DropdownMenu;