import React, { useState, useEffect } from 'react';
import { CalendarEvent, EventColor, RecurrenceType } from '../types';
import { X } from 'lucide-react';
import { format } from 'date-fns';

interface EventModalProps {
  selectedDate: Date;
  selectedEvent: CalendarEvent | null;
  onSave: (
    title: string,
    start: Date,
    end: Date,
    description: string,
    color: EventColor,
    recurrenceType: RecurrenceType,
    endDate?: Date,
    daysOfWeek?: number[],
    customInterval?: number,
    customUnit?: 'days' | 'weeks' | 'months'
  ) => void;
  onClose: () => void;
}

export function EventModal({
  selectedDate,
  selectedEvent,
  onSave,
  onClose,
}: EventModalProps) {
  // Initialize state with either the selected event's values or defaults
  const [title, setTitle] = useState(selectedEvent?.title || '');
  const [startDate, setStartDate] = useState(
    format(selectedEvent?.start || selectedDate, 'yyyy-MM-dd')
  );
  const [startTime, setStartTime] = useState(
    format(selectedEvent?.start || new Date(selectedDate.setHours(9, 0, 0)), 'HH:mm')
  );
  const [endDate, setEndDate] = useState(
    format(selectedEvent?.end || selectedDate, 'yyyy-MM-dd')
  );
  const [endTime, setEndTime] = useState(
    format(selectedEvent?.end || new Date(selectedDate.setHours(10, 0, 0)), 'HH:mm')
  );
  const [description, setDescription] = useState(selectedEvent?.description || '');
  const [color, setColor] = useState<EventColor>(selectedEvent?.color || 'blue');
  const [recurrenceType, setRecurrenceType] = useState<RecurrenceType>(
    selectedEvent?.recurrence.type || RecurrenceType.NONE
  );
  const [recurrenceEndDate, setRecurrenceEndDate] = useState(
    selectedEvent?.recurrence.endDate
      ? format(selectedEvent.recurrence.endDate, 'yyyy-MM-dd')
      : ''
  );
  const [weeklyDays, setWeeklyDays] = useState<number[]>(
    selectedEvent?.recurrence.weekly?.daysOfWeek || []
  );
  const [customInterval, setCustomInterval] = useState<number>(
    selectedEvent?.recurrence.custom?.interval || 1
  );
  const [customUnit, setCustomUnit] = useState<'days' | 'weeks' | 'months'>(
    selectedEvent?.recurrence.custom?.unit || 'days'
  );

  useEffect(() => {
    // Set initial focus on title input when modal opens
    const titleInput = document.getElementById('event-title');
    if (titleInput) {
      titleInput.focus();
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!title.trim()) {
      alert('Event title is required');
      return;
    }
    
    // Create Date objects for start and end times
    const start = new Date(`${startDate}T${startTime}`);
    const end = new Date(`${endDate}T${endTime}`);
    
    // Validate dates
    if (end < start) {
      alert('End time must be after start time');
      return;
    }
    
    // Process recurrence end date if applicable
    let recurrenceEnd: Date | undefined;
    if (recurrenceType !== RecurrenceType.NONE && recurrenceEndDate) {
      recurrenceEnd = new Date(recurrenceEndDate);
      recurrenceEnd.setHours(23, 59, 59, 999); // Set to end of day
    }
    
    onSave(
      title,
      start,
      end,
      description,
      color,
      recurrenceType,
      recurrenceEnd,
      recurrenceType === RecurrenceType.WEEKLY ? weeklyDays : undefined,
      recurrenceType === RecurrenceType.CUSTOM ? customInterval : undefined,
      recurrenceType === RecurrenceType.CUSTOM ? customUnit : undefined
    );
  };

  const handleWeeklyDayToggle = (day: number) => {
    if (weeklyDays.includes(day)) {
      setWeeklyDays(weeklyDays.filter((d) => d !== day));
    } else {
      setWeeklyDays([...weeklyDays, day]);
    }
  };

  // Array for weekday labels
  const weekdays = [
    { value: 0, label: 'Sun' },
    { value: 1, label: 'Mon' },
    { value: 2, label: 'Tue' },
    { value: 3, label: 'Wed' },
    { value: 4, label: 'Thu' },
    { value: 5, label: 'Fri' },
    { value: 6, label: 'Sat' },
  ];

  const colorOptions: { value: EventColor; label: string; class: string }[] = [
    { value: 'blue', label: 'Blue', class: 'bg-primary-500' },
    { value: 'green', label: 'Green', class: 'bg-success-500' },
    { value: 'red', label: 'Red', class: 'bg-error-500' },
    { value: 'purple', label: 'Purple', class: 'bg-purple-500' },
    { value: 'yellow', label: 'Yellow', class: 'bg-warning-500' },
    { value: 'teal', label: 'Teal', class: 'bg-secondary-500' },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-modal w-full max-w-lg overflow-hidden animate-slide-up">
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">
            {selectedEvent ? 'Edit Event' : 'Add New Event'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4">
          <div className="space-y-4">
            {/* Title */}
            <div>
              <label htmlFor="event-title" className="block text-sm font-medium text-gray-700 mb-1">
                Event Title <span className="text-error-500">*</span>
              </label>
              <input
                id="event-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="block w-full rounded-md border-gray-300 border px-4 py-2 focus:border-primary-500 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
                placeholder="Add title"
                required
              />
            </div>
            
            {/* Dates and Times */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="start-date" className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date
                </label>
                <input
                  id="start-date"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="block w-full rounded-md border-gray-300 border px-4 py-2 focus:border-primary-500 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
                />
              </div>
              
              <div>
                <label htmlFor="start-time" className="block text-sm font-medium text-gray-700 mb-1">
                  Start Time
                </label>
                <input
                  id="start-time"
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="block w-full rounded-md border-gray-300 border px-4 py-2 focus:border-primary-500 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
                />
              </div>
              
              <div>
                <label htmlFor="end-date" className="block text-sm font-medium text-gray-700 mb-1">
                  End Date
                </label>
                <input
                  id="end-date"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="block w-full rounded-md border-gray-300 border px-4 py-2 focus:border-primary-500 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
                />
              </div>
              
              <div>
                <label htmlFor="end-time" className="block text-sm font-medium text-gray-700 mb-1">
                  End Time
                </label>
                <input
                  id="end-time"
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="block w-full rounded-md border-gray-300 border px-4 py-2 focus:border-primary-500 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
                />
              </div>
            </div>
            
            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="block w-full rounded-md border-gray-300 border px-4 py-2 focus:border-primary-500 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
                placeholder="Add description (optional)"
              />
            </div>
            
            {/* Color Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Event Color
              </label>
              <div className="flex space-x-2">
                {colorOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    className={`w-8 h-8 rounded-full ${
                      color === option.value ? 'ring-2 ring-offset-2 ring-gray-400' : ''
                    } ${option.class}`}
                    onClick={() => setColor(option.value)}
                    aria-label={`Select ${option.label} color`}
                  />
                ))}
              </div>
            </div>
            
            {/* Recurrence Options */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Recurrence
              </label>
              <select
                value={recurrenceType}
                onChange={(e) => setRecurrenceType(e.target.value as RecurrenceType)}
                className="block w-full rounded-md border-gray-300 border px-4 py-2 focus:border-primary-500 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
              >
                <option value={RecurrenceType.NONE}>Does not repeat</option>
                <option value={RecurrenceType.DAILY}>Daily</option>
                <option value={RecurrenceType.WEEKLY}>Weekly</option>
                <option value={RecurrenceType.MONTHLY}>Monthly</option>
                <option value={RecurrenceType.CUSTOM}>Custom</option>
              </select>
            </div>
            
            {/* Conditional Recurrence Fields */}
            {recurrenceType !== RecurrenceType.NONE && (
              <div>
                <label htmlFor="recurrence-end" className="block text-sm font-medium text-gray-700 mb-1">
                  End Recurrence (Optional)
                </label>
                <input
                  id="recurrence-end"
                  type="date"
                  value={recurrenceEndDate}
                  onChange={(e) => setRecurrenceEndDate(e.target.value)}
                  className="block w-full rounded-md border-gray-300 border px-4 py-2 focus:border-primary-500 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
                />
              </div>
            )}
            
            {/* Weekly Recurrence Options */}
            {recurrenceType === RecurrenceType.WEEKLY && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Repeat on
                </label>
                <div className="flex flex-wrap gap-2">
                  {weekdays.map((day) => (
                    <button
                      key={day.value}
                      type="button"
                      className={`h-8 w-8 rounded-full text-xs flex items-center justify-center ${
                        weeklyDays.includes(day.value)
                          ? 'bg-primary-500 text-white'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                      onClick={() => handleWeeklyDayToggle(day.value)}
                    >
                      {day.label.charAt(0)}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {/* Custom Recurrence Options */}
            {recurrenceType === RecurrenceType.CUSTOM && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="custom-interval" className="block text-sm font-medium text-gray-700 mb-1">
                    Repeat Every
                  </label>
                  <input
                    id="custom-interval"
                    type="number"
                    min="1"
                    value={customInterval}
                    onChange={(e) => setCustomInterval(parseInt(e.target.value))}
                    className="block w-full rounded-md border-gray-300 border px-4 py-2 focus:border-primary-500 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
                  />
                </div>
                
                <div>
                  <label htmlFor="custom-unit" className="block text-sm font-medium text-gray-700 mb-1">
                    Unit
                  </label>
                  <select
                    id="custom-unit"
                    value={customUnit}
                    onChange={(e) => setCustomUnit(e.target.value as 'days' | 'weeks' | 'months')}
                    className="block w-full rounded-md border-gray-300 border px-4 py-2 focus:border-primary-500 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
                  >
                    <option value="days">Days</option>
                    <option value="weeks">Weeks</option>
                    <option value="months">Months</option>
                  </select>
                </div>
              </div>
            )}
          </div>
          
          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-white bg-primary-600 rounded-md shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              {selectedEvent ? 'Update Event' : 'Add Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}