import React, { useState, useRef } from 'react';
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, format, isSameMonth, isToday, isSameDay } from 'date-fns';
import { DayCell } from './DayCell';
import { CalendarEvent } from '../types';
import { useEvents } from '../context/EventContext';

interface CalendarGridProps {
  currentDate: Date;
  onDateClick: (date: Date) => void;
  onEventClick: (event: CalendarEvent) => void;
}

export function CalendarGrid({ currentDate, onDateClick, onEventClick }: CalendarGridProps) {
  const { getEventsForDay, moveEvent } = useEvents();
  const [draggedEvent, setDraggedEvent] = useState<{ id: string, originalDate: Date } | null>(null);
  const dragCounter = useRef(0);
  
  // Generate days for the current month view
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  
  const days = eachDayOfInterval({
    start: calendarStart,
    end: calendarEnd,
  });

  // Handle drag start for an event
  const handleDragStart = (event: React.DragEvent, eventId: string, eventDate: Date) => {
    event.dataTransfer.setData('text/plain', eventId);
    event.dataTransfer.effectAllowed = 'move';
    
    // Store the dragged event information
    setDraggedEvent({ id: eventId, originalDate: eventDate });
    
    // Create a custom drag ghost (optional)
    const ghost = document.createElement('div');
    ghost.classList.add('bg-primary-100', 'p-2', 'rounded', 'text-sm');
    ghost.textContent = 'Dragging event...';
    document.body.appendChild(ghost);
    event.dataTransfer.setDragImage(ghost, 0, 0);
    
    setTimeout(() => {
      document.body.removeChild(ghost);
    }, 0);
  };

  // Handle drag over a day cell
  const handleDragOver = (event: React.DragEvent, date: Date) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  };
  
  // Handle drag enter for visual feedback
  const handleDragEnter = (event: React.DragEvent) => {
    event.preventDefault();
    dragCounter.current += 1;
    const target = event.currentTarget as HTMLElement;
    target.classList.add('bg-primary-50');
  };
  
  // Handle drag leave for visual feedback
  const handleDragLeave = (event: React.DragEvent) => {
    event.preventDefault();
    dragCounter.current -= 1;
    if (dragCounter.current === 0) {
      const target = event.currentTarget as HTMLElement;
      target.classList.remove('bg-primary-50');
    }
  };
  
  // Handle drop to move an event
  const handleDrop = (event: React.DragEvent, date: Date) => {
    event.preventDefault();
    dragCounter.current = 0;
    const target = event.currentTarget as HTMLElement;
    target.classList.remove('bg-primary-50');
    
    const eventId = event.dataTransfer.getData('text/plain');
    
    if (eventId && draggedEvent) {
      moveEvent(eventId, date);
    }
    
    setDraggedEvent(null);
  };

  // Week day headers
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="bg-white p-4">
      {/* Week day headers */}
      <div className="grid grid-cols-7 mb-2">
        {weekDays.map((day, i) => (
          <div key={i} className="text-center font-medium text-gray-500 py-2">
            {day}
          </div>
        ))}
      </div>
      
      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-px bg-gray-200">
        {days.map((day) => {
          const dayEvents = getEventsForDay(day);
          const isCurrentMonth = isSameMonth(day, currentDate);
          
          return (
            <DayCell
              key={day.toISOString()}
              date={day}
              events={dayEvents}
              isCurrentMonth={isCurrentMonth}
              isToday={isToday(day)}
              onDateClick={() => onDateClick(day)}
              onEventClick={onEventClick}
              onDragStart={handleDragStart}
              onDragOver={(e) => handleDragOver(e, day)}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, day)}
            />
          );
        })}
      </div>
    </div>
  );
}