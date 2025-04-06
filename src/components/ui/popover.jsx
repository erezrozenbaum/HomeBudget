import React, { useState, useRef, useEffect } from "react";

const Popover = ({ children }) => {
  const [open, setOpen] = useState(false);
  const popoverRef = useRef(null);
  
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  
  return (
    <div className="relative" ref={popoverRef}>
      {React.Children.map(children, child => {
        if (child.type === PopoverTrigger) {
          return React.cloneElement(child, { 
            onClick: () => setOpen(!open) 
          });
        }
        if (child.type === PopoverContent) {
          return open ? React.cloneElement(child) : null;
        }
        return child;
      })}
    </div>
  );
};

const PopoverTrigger = ({ children, asChild, onClick }) => {
  if (asChild) {
    return React.cloneElement(children, { onClick });
  }
  return (
    <button onClick={onClick}>
      {children}
    </button>
  );
};

const PopoverContent = ({ 
  children, 
  className = "", 
  align = "center", 
  sideOffset = 4 
}) => {
  const alignClass = align === "start" 
    ? "left-0" 
    : align === "end" 
      ? "right-0" 
      : "left-1/2 transform -translate-x-1/2";

  return (
    <div 
      className={`absolute z-50 mt-${sideOffset} ${alignClass} ${className}`}
      style={{ minWidth: 'max-content' }}
    >
      {children}
    </div>
  );
};

export { Popover, PopoverTrigger, PopoverContent };
export default Popover;