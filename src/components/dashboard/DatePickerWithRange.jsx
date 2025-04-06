import React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export function DatePickerWithRange({ className, value, onChange }) {
  // Ensure dates are properly converted for display
  const formatDate = (date) => {
    if (!date) return "";
    // If it's a string, convert to Date
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return format(dateObj, "LLL dd, y");
  };

  // Create display text for the date range
  const displayText = React.useMemo(() => {
    if (!value || (!value.from && !value.to)) return "Pick a date range";
    if (value.from && !value.to) return formatDate(value.from);
    return `${formatDate(value.from)} - ${formatDate(value.to)}`;
  }, [value]);

  // Convert string dates to Date objects for the Calendar component
  const getDateRangeForCalendar = () => {
    if (!value) return { from: undefined, to: undefined };
    
    return {
      from: value.from ? new Date(value.from) : undefined,
      to: value.to ? new Date(value.to) : undefined
    };
  };

  const handleSelect = (dates) => {
    if (!onChange) return;
    
    // Ensure we convert dates to strings before sending them up
    const result = {
      from: dates.from ? dates.from.toISOString() : null,
      to: dates.to ? dates.to.toISOString() : null
    };
    
    onChange(result);
  };

  return (
    <div className={className}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={`w-full justify-start text-left font-normal bg-gray-800 border-gray-700 text-gray-200 hover:bg-gray-700 hover:text-white ${
              !value?.from ? "text-gray-400" : ""
            }`}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {displayText}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={value?.from ? new Date(value.from) : new Date()}
            selected={getDateRangeForCalendar()}
            onSelect={handleSelect}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}