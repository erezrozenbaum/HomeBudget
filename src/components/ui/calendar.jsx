import React from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { format, addMonths, subMonths, getDaysInMonth, startOfMonth, getDay, isSameDay, isToday, addDays } from "date-fns";

export function Calendar({
  className,
  mode = "single",
  selected,
  onSelect,
  numberOfMonths = 1,
  defaultMonth,
  ...props
}) {
  const [currentMonth, setCurrentMonth] = React.useState(defaultMonth || new Date());

  // Generate days for a month grid
  const getDaysForMonth = (month) => {
    const daysInMonth = getDaysInMonth(month);
    const firstDayOfMonth = getDay(startOfMonth(month));
    
    let days = [];
    
    // Previous month days (to fill the grid)
    for (let i = 0; i < firstDayOfMonth; i++) {
      const prevMonthDay = subMonths(month, 1);
      prevMonthDay.setDate(getDaysInMonth(prevMonthDay) - (firstDayOfMonth - i - 1));
      days.push({ date: new Date(prevMonthDay), isCurrentMonth: false });
    }
    
    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      const currentDate = new Date(month.getFullYear(), month.getMonth(), i);
      days.push({ date: currentDate, isCurrentMonth: true });
    }
    
    // Next month days (to fill the grid)
    const totalDaysToShow = Math.ceil((firstDayOfMonth + daysInMonth) / 7) * 7;
    const remainingDays = totalDaysToShow - days.length;
    
    for (let i = 1; i <= remainingDays; i++) {
      const nextMonthDay = new Date(month.getFullYear(), month.getMonth() + 1, i);
      days.push({ date: nextMonthDay, isCurrentMonth: false });
    }
    
    return days;
  };

  const handlePrevMonth = () => {
    setCurrentMonth(prev => subMonths(prev, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(prev => addMonths(prev, 1));
  };

  const handleDateClick = (date) => {
    if (!onSelect) return;
    
    if (mode === "single") {
      onSelect(date);
    } else if (mode === "range") {
      if (!selected || !selected.from || (selected.from && selected.to)) {
        onSelect({ from: date, to: undefined });
      } else {
        const { from } = selected;
        if (date < from) {
          onSelect({ from: date, to: from });
        } else {
          onSelect({ from, to: date });
        }
      }
    }
  };

  // Check if a date is selected
  const isDateSelected = (date) => {
    if (!selected) return false;
    
    if (mode === "single") {
      return selected && isSameDay(date, selected);
    } else if (mode === "range") {
      return (
        (selected.from && isSameDay(date, selected.from)) ||
        (selected.to && isSameDay(date, selected.to))
      );
    }
    
    return false;
  };

  // Check if a date is in the selected range
  const isDateInRange = (date) => {
    if (!selected || mode !== "range" || !selected.from || !selected.to) return false;
    return date > selected.from && date < selected.to;
  };

  // Render calendar for a specific month
  const renderMonth = (monthToRender, monthIndex) => {
    const days = getDaysForMonth(monthToRender);
    const weekDays = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
    
    return (
      <div key={monthIndex} className="w-full">
        <div className="text-center mb-2 font-semibold text-gray-200">
          {format(monthToRender, "MMMM yyyy")}
        </div>
        
        <div className="grid grid-cols-7 gap-1 mb-2">
          {weekDays.map((day) => (
            <div key={day} className="text-center text-xs font-medium text-gray-400">
              {day}
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-7 gap-1">
          {days.map(({ date, isCurrentMonth }, index) => {
            const isSelected = isDateSelected(date);
            const isInRange = isDateInRange(date);
            const isCurrentDay = isToday(date);
            
            let className = "flex h-8 w-8 items-center justify-center rounded-md text-sm";
            
            if (!isCurrentMonth) {
              className += " text-gray-500";
            } else {
              className += " text-gray-200";
            }
            
            if (isSelected) {
              className += " bg-blue-600 text-white";
            } else if (isInRange) {
              className += " bg-blue-600/20 text-blue-200";
            } else if (isCurrentDay) {
              className += " border border-blue-500 text-blue-300";
            }
            
            return (
              <button
                key={index}
                type="button"
                className={className}
                onClick={() => handleDateClick(date)}
                disabled={!isCurrentMonth}
              >
                {date.getDate()}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className={`bg-gray-900 text-white p-4 rounded-md border border-gray-700 ${className || ""}`}>
      <div className="flex justify-between items-center mb-4">
        <Button
          variant="outline"
          size="sm"
          onClick={handlePrevMonth}
          className="bg-gray-800 border-gray-700 text-gray-200 hover:bg-gray-700"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        <div className="flex items-center">
          {numberOfMonths === 1 && (
            <div className="text-lg font-semibold text-white">
              {format(currentMonth, "MMMM yyyy")}
            </div>
          )}
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={handleNextMonth}
          className="bg-gray-800 border-gray-700 text-gray-200 hover:bg-gray-700"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      
      <div className={`grid ${numberOfMonths > 1 ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'} gap-6`}>
        {Array.from({ length: numberOfMonths }).map((_, index) => {
          const monthToRender = addMonths(currentMonth, index);
          return renderMonth(monthToRender, index);
        })}
      </div>
    </div>
  );
}