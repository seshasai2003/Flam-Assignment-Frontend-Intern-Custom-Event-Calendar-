import React from 'react';
import { format } from 'date-fns';
import { CalendarEvent } from '../types';
import { EventItem } from './EventItem';

interface DayCellProps {
  date: Date;
  events: CalendarEvent[];
  isCurrentMonth: boolean;
  isToday: boolean;
  onDateClick: () => void;
  onEventClick: (event: CalendarEvent) => void;
  onDragStart: (event: React.DragEvent, eventId: string, eventDate: Date) => void;
  onDragOver: (event: React.DragEvent) => void;
  onDragEnter: (event: React.DragEvent) => void;
  onDragLeave: (event: React.DragEvent) => void;
  onDrop: (event: React.DragEvent) => void;
}

export function DayCell({
  date,
  events,
  isCurrentMonth,
  isToday,
  onDateClick,
  onEventClick,
  onDragStart,
  onDragOver,
  onDragEnter,
  onDragLeave,
  onDrop,
}: DayCellProps) {
  // Sort events by start time
  const sortedEvents = [...events].sort(
    (a, b) => a.start.getTime() - b.start.getTime()
  );
  
  // Limit the number of events to display
  const MAX_VISIBLE_EVENTS = 3;
  const visibleEvents = sortedEvents.slice(0, MAX_VISIBLE_EVENTS);
  const hiddenEventCount = Math.max(0, sortedEvents.length - MAX_VISIBLE_EVENTS);

  return (
    <div
      className={`min-h-[120px] border border-gray-100 bg-white p-1 ${
        isCurrentMonth ? '' : 'opacity-50'
      } ${isToday ? 'bg-primary-50' : ''}`}
      onClick={onDateClick}
      onDragOver={onDragOver}
      onDragEnter={onDragEnter}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      <div className="flex justify-between items-center mb-1">
        <span
          className={`text-sm font-medium rounded-full w-7 h-7 flex items-center justify-center ${
            isToday
              ? 'bg-primary-500 text-white'
              : 'text-gray-700'
          }`}
        >
          {format(date, 'd')}
        </span>
        {isCurrentMonth && (
          <span className="text-xs text-gray-500">{format(date, 'EEE')}</span>
        )}
      </div>
      
      <div className="space-y-1 mt-1">
        {visibleEvents.map((event) => (
          <EventItem
            key={`${event.id}-${format(event.start, 'yyyy-MM-dd')}`}
            event={event}
            onClick={(e) => {
              e.stopPropagation();
              onEventClick(event);
            }}
            onDragStart={(e) => {
              e.stopPropagation();
              onDragStart(e, event.id, event.start);
            }}
          />
        ))}
        
        {hiddenEventCount > 0 && (
          <div className="text-xs text-gray-500 pl-1">
            +{hiddenEventCount} more
          </div>
        )}
      </div>
    </div>
  );
}