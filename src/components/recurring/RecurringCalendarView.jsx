import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isToday,
  isSameMonth,
  addMonths,
  subMonths,
  getDay
} from "date-fns";
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar, 
  ArrowUpRight, 
  ArrowDownRight 
} from "lucide-react";

export default function RecurringCalendarView({ 
  transactions, 
  categories, 
  accounts, 
  creditCards 
}) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarDays, setCalendarDays] = useState([]);
  const [events, setEvents] = useState([]);
  const [selectedDay, setSelectedDay] = useState(null);
  
  useEffect(() => {
    generateCalendarDays();
  }, [currentDate]);
  
  useEffect(() => {
    generateEvents();
  }, [transactions, currentDate]);
  
  const generateCalendarDays = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const startDate = monthStart;
    const endDate = monthEnd;
    
    const days = eachDayOfInterval({ start: startDate, end: endDate });
    
    // Add empty cells for days before the first day of the month
    const firstDayOfMonth = getDay(monthStart); // 0 is Sunday, 1 is Monday, etc.
    const emptyDaysBefore = Array(firstDayOfMonth).fill(null);
    
    // Add empty cells after the last day of the month to complete the last row
    const lastDayOfMonth = getDay(monthEnd);
    const emptyDaysAfter = Array(6 - lastDayOfMonth).fill(null);
    
    setCalendarDays([...emptyDaysBefore, ...days, ...emptyDaysAfter]);
  };
  
  const generateEvents = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    
    const eventsForMonth = transactions.flatMap(transaction => {
      if (!transaction.start_date) return [];
      
      const startDate = new Date(transaction.start_date);
      
      // If the transaction starts after the current month or has ended before it, skip
      if (startDate > monthEnd || 
          (transaction.end_date && new Date(transaction.end_date) < monthStart)) {
        return [];
      }
      
      // Generate occurrences based on frequency
      return generateOccurrences(transaction, monthStart, monthEnd);
    });
    
    setEvents(eventsForMonth);
  };
  
  const generateOccurrences = (transaction, monthStart, monthEnd) => {
    const occurrences = [];
    const startDate = new Date(transaction.start_date);
    const endDate = transaction.end_date ? new Date(transaction.end_date) : null;
    
    let currentDate = new Date(startDate);
    
    while (currentDate <= monthEnd) {
      if (currentDate >= monthStart && (!endDate || currentDate <= endDate)) {
        occurrences.push({
          id: `${transaction.id}-${currentDate.getTime()}`,
          transactionId: transaction.id,
          name: transaction.name,
          amount: transaction.amount,
          currency: transaction.currency,
          type: transaction.type,
          date: new Date(currentDate),
          category: categories.find(c => c.id === transaction.category)?.name,
          account: accounts.find(a => a.id === transaction.bank_account_id)?.name,
          creditCard: creditCards.find(c => c.id === transaction.credit_card_id)?.name,
          frequency: transaction.frequency
        });
      }
      
      // Move to the next occurrence based on frequency
      currentDate = getNextOccurrenceDate(currentDate, transaction.frequency);
      
      // Safety break to prevent infinite loops
      if (occurrences.length > 100) break;
    }
    
    return occurrences;
  };
  
  const getNextOccurrenceDate = (date, frequency) => {
    const newDate = new Date(date);
    
    switch (frequency) {
      case 'daily':
        newDate.setDate(newDate.getDate() + 1);
        break;
      case 'weekly':
        newDate.setDate(newDate.getDate() + 7);
        break;
      case 'bi-weekly':
        newDate.setDate(newDate.getDate() + 14);
        break;
      case 'monthly':
        newDate.setMonth(newDate.getMonth() + 1);
        break;
      case 'quarterly':
        newDate.setMonth(newDate.getMonth() + 3);
        break;
      case 'annually':
        newDate.setFullYear(newDate.getFullYear() + 1);
        break;
      default:
        newDate.setMonth(newDate.getMonth() + 1);
    }
    
    return newDate;
  };
  
  const getEventsForDay = (day) => {
    if (!day) return [];
    
    return events.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate.getDate() === day.getDate() && 
             eventDate.getMonth() === day.getMonth() && 
             eventDate.getFullYear() === day.getFullYear();
    });
  };
  
  const nextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };
  
  const prevMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };
  
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <CardTitle>
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                {format(currentDate, 'MMMM yyyy')}
              </div>
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={prevMonth}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={() => setCurrentDate(new Date())}>
                Today
              </Button>
              <Button variant="outline" size="icon" onClick={nextMonth}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-1">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, i) => (
              <div key={i} className="text-center py-2 font-medium text-sm">
                {day}
              </div>
            ))}
            
            {calendarDays.map((day, i) => {
              if (!day) {
                return (
                  <div key={`empty-${i}`} className="h-24 bg-muted/20 rounded-md" />
                );
              }
              
              const dayEvents = getEventsForDay(day);
              const isCurrentMonth = isSameMonth(day, currentDate);
              const isCurrentDay = isToday(day);
              const isSelected = selectedDay && day.getDate() === selectedDay.getDate() && 
                               day.getMonth() === selectedDay.getMonth() && 
                               day.getFullYear() === selectedDay.getFullYear();
              
              return (
                <div 
                  key={i}
                  className={`p-1 min-h-24 border rounded-md cursor-pointer transition-colors hover:bg-muted/30 ${
                    isCurrentDay ? 'bg-primary/10 border-primary/30' : 
                    isSelected ? 'bg-secondary/30 border-secondary' : 
                    !isCurrentMonth ? 'opacity-40' : ''
                  }`}
                  onClick={() => setSelectedDay(day)}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className={`text-sm font-medium rounded-full w-6 h-6 flex items-center justify-center ${
                      isCurrentDay ? 'bg-primary text-primary-foreground' : ''
                    }`}>
                      {format(day, 'd')}
                    </span>
                    {dayEvents.length > 0 && (
                      <Badge variant="outline" className="text-xs">
                        {dayEvents.length}
                      </Badge>
                    )}
                  </div>
                  
                  <div className="space-y-1 overflow-hidden max-h-16">
                    {dayEvents.slice(0, 2).map((event, index) => (
                      <div 
                        key={event.id} 
                        className={`px-1 py-0.5 text-xs rounded truncate ${
                          event.type === 'income' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {event.type === 'income' ? (
                          <ArrowUpRight className="w-3 h-3 inline" />
                        ) : (
                          <ArrowDownRight className="w-3 h-3 inline" />
                        )}
                        <span className="ml-1">{event.name}</span>
                      </div>
                    ))}
                    {dayEvents.length > 2 && (
                      <div className="text-xs text-muted-foreground text-center">
                        +{dayEvents.length - 2} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
      
      {selectedDay && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">
              Events for {format(selectedDay, 'MMMM d, yyyy')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {getEventsForDay(selectedDay).map((event) => (
                <div 
                  key={event.id}
                  className={`p-3 border rounded-md ${
                    event.type === 'income' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium">{event.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {event.category && `Category: ${event.category}`}
                        {event.account && ` • Account: ${event.account}`}
                        {event.creditCard && ` • Card: ${event.creditCard}`}
                      </div>
                    </div>
                    <div className={`font-semibold ${
                      event.type === 'income' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {event.type === 'income' ? '+' : '-'} 
                      {event.currency} {event.amount.toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
              
              {getEventsForDay(selectedDay).length === 0 && (
                <div className="text-center py-6 text-muted-foreground">
                  No recurring transactions for this day
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}