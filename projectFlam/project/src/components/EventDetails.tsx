import React from 'react';
import { format } from 'date-fns';
import { CalendarEvent, RecurrenceType } from '../types';
import { X, Edit, Trash, Calendar, Clock, RepeatIcon, AlignLeft } from 'lucide-react';

interface EventDetailsProps {
  event: CalendarEvent;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function EventDetails({ event, onClose, onEdit, onDelete }: EventDetailsProps) {

  const headerColorClasses = {
    blue: 'bg-primary-500',
    green: 'bg-success-500',
    red: 'bg-error-500',
    purple: 'bg-purple-500',
    yellow: 'bg-warning-500',
    teal: 'bg-secondary-500',
  };

  const getRecurrenceText = () => {
    switch (event.recurrence.type) {
      case RecurrenceType.NONE:
        return 'Does not repeat';
      case RecurrenceType.DAILY:
        return 'Repeats daily';
      case RecurrenceType.WEEKLY:
        if (event.recurrence.weekly && event.recurrence.weekly.daysOfWeek.length > 0) {
          const days = event.recurrence.weekly.daysOfWeek
            .sort()
            .map((day) => ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][day])
            .join(', ');
          return `Repeats weekly on ${days}`;
        }
        return 'Repeats weekly';
      case RecurrenceType.MONTHLY:
        return `Repeats monthly on day ${format(event.start, 'd')}`;
      case RecurrenceType.CUSTOM:
        if (event.recurrence.custom) {
          return `Repeats every ${event.recurrence.custom.interval} ${event.recurrence.custom.unit}`;
        }
        return 'Custom recurrence';
      default:
        return 'Unknown recurrence pattern';
    }
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      onDelete();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-modal w-full max-w-md overflow-hidden animate-slide-up">
        <div className={`${headerColorClasses[event.color]} text-white p-4 relative`}>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white hover:text-gray-200 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
          <h2 className="text-xl font-semibold">{event.title}</h2>
          <div className="mt-2 flex items-center text-sm">
            <Calendar className="h-4 w-4 mr-1" />
            <span>{format(event.start, 'EEEE, MMMM d, yyyy')}</span>
          </div>
        </div>
        
        <div className="p-4 space-y-4">
          {/* Time */}
          <div className="flex items-start">
            <Clock className="h-5 w-5 text-gray-500 mr-3 mt-0.5" />
            <div>
              <div className="font-medium">Time</div>
              <div className="text-gray-600">
                {format(event.start, 'h:mm a')} - {format(event.end, 'h:mm a')}
              </div>
            </div>
          </div>
          
          {/* Recurrence */}
          <div className="flex items-start">
            <RepeatIcon className="h-5 w-5 text-gray-500 mr-3 mt-0.5" />
            <div>
              <div className="font-medium">Recurrence</div>
              <div className="text-gray-600">
                {getRecurrenceText()}
                {event.recurrence.endDate && (
                  <div className="text-sm">
                    Until {format(event.recurrence.endDate, 'MMMM d, yyyy')}
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Description */}
          {event.description && (
            <div className="flex items-start">
              <AlignLeft className="h-5 w-5 text-gray-500 mr-3 mt-0.5" />
              <div>
                <div className="font-medium">Description</div>
                <div className="text-gray-600 whitespace-pre-line">{event.description}</div>
              </div>
            </div>
          )}
        </div>
        
        <div className="border-t border-gray-200 p-4 flex justify-end space-x-3">
          <button
            onClick={handleDelete}
            className="flex items-center px-4 py-2 text-error-600 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-error-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-error-500"
          >
            <Trash className="h-4 w-4 mr-1" />
            Delete
          </button>
          <button
            onClick={onEdit}
            className="flex items-center px-4 py-2 text-white bg-primary-600 rounded-md shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <Edit className="h-4 w-4 mr-1" />
            Edit
          </button>
        </div>
      </div>
    </div>
  );
}