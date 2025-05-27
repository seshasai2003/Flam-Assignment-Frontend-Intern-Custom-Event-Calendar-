import React from 'react';
import { format } from 'date-fns';
import { CalendarEvent, RecurrenceType } from '../types';
import { RepeatIcon } from 'lucide-react';

interface EventItemProps {
  event: CalendarEvent;
  onClick: (e: React.MouseEvent) => void;
  onDragStart: (e: React.DragEvent) => void;
}

export function EventItem({ event, onClick, onDragStart }: EventItemProps) {
  const colorClasses = {
    blue: 'bg-primary-100 border-l-4 border-primary-500 text-primary-800',
    green: 'bg-success-50 border-l-4 border-success-500 text-success-700',
    red: 'bg-error-50 border-l-4 border-error-500 text-error-700',
    purple: 'bg-purple-100 border-l-4 border-purple-500 text-purple-800',
    yellow: 'bg-warning-50 border-l-4 border-warning-500 text-warning-700',
    teal: 'bg-secondary-100 border-l-4 border-secondary-500 text-secondary-800',
  };

  const isRecurring = event.recurrence.type !== RecurrenceType.NONE;

  return (
    <div
      className={`${
        colorClasses[event.color]
      } px-2 py-1 rounded-sm shadow-event text-xs cursor-pointer truncate transition-all hover:shadow-md group`}
      onClick={onClick}
      draggable="true"
      onDragStart={onDragStart}
    >
      <div className="flex items-center justify-between">
        <span className="font-medium truncate flex-1">{event.title}</span>
        {isRecurring && <RepeatIcon size={12} className="flex-shrink-0 ml-1" />}
      </div>
      <div className="text-xs opacity-75">
        {format(event.start, 'h:mm a')}
      </div>
    </div>
  );
}