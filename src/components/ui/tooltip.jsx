import React, { useState } from 'react';

const TooltipProvider = ({ children }) => children;

const Tooltip = ({ children }) => children;

const TooltipTrigger = ({ children, asChild }) => {
  return asChild ? children : <span>{children}</span>;
};

const TooltipContent = ({ children, className = "" }) => {
  return (
    <div className={`z-50 absolute -top-8 left-1/2 -translate-x-1/2 rounded-md border border-gray-700 bg-gray-800 px-3 py-1.5 text-sm text-gray-200 shadow-md ${className}`}>
      {children}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full w-2 h-2 border-gray-700 border-l border-b rotate-[-45deg] bg-gray-800" />
    </div>
  );
};

const TooltipComponent = ({ children, content, className }) => {
  const [show, setShow] = useState(false);

  return (
    <div 
      className="relative inline-block"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
      onFocus={() => setShow(true)}
      onBlur={() => setShow(false)}
    >
      {children}
      {show && (
        <div className={`absolute z-50 whitespace-nowrap ${className}`}>
          <div className="px-2 py-1 text-sm text-white bg-gray-800 rounded-md border border-gray-700 shadow-lg">
            {content}
          </div>
        </div>
      )}
    </div>
  );
};

export default TooltipComponent;
export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };