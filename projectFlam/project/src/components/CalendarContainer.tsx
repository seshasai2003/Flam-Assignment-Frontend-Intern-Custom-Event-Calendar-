import { useState } from 'react';
import { CalendarHeader } from './CalendarHeader';
import { CalendarGrid } from './CalendarGrid';
import { EventModal } from './EventModal';
import { CalendarEvent, EventColor, RecurrenceType } from '../types';
import { EventDetails } from './EventDetails';
import { useEvents } from '../context/EventContext';

export function CalendarContainer() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [showEventDetails, setShowEventDetails] = useState(false);

  const { addEvent, updateEvent, deleteEvent, checkForEventConflicts } = useEvents();

  const handlePrevMonth = () => {
    setCurrentDate((prevDate) => {
      const newDate = new Date(prevDate);
      newDate.setMonth(prevDate.getMonth() - 1);
      return newDate;
    });
  };

  const handleNextMonth = () => {
    setCurrentDate((prevDate) => {
      const newDate = new Date(prevDate);
      newDate.setMonth(prevDate.getMonth() + 1);
      return newDate;
    });
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    setSelectedEvent(null);
    setIsModalOpen(true);
  };

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setShowEventDetails(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedDate(null);
    setSelectedEvent(null);
  };

  const handleCloseEventDetails = () => {
    setShowEventDetails(false);
    setSelectedEvent(null);
  };

  const handleEditEvent = () => {
    setShowEventDetails(false);
    setIsModalOpen(true);
  };

  const handleSaveEvent = (
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
  ) => {
    const recurrence = {
      type: recurrenceType,
      endDate: endDate,
      weekly: recurrenceType === RecurrenceType.WEEKLY ? { daysOfWeek: daysOfWeek || [] } : undefined,
      custom:
        recurrenceType === RecurrenceType.CUSTOM && customInterval && customUnit
          ? { interval: customInterval, unit: customUnit }
          : undefined,
    };

    const eventData = {
      title,
      start,
      end,
      description,
      color,
      recurrence,
    };

    if (selectedEvent) {
      // Updating existing event
      const updatedEvent = { ...eventData, id: selectedEvent.id };
      if (!checkForEventConflicts(updatedEvent, selectedEvent.id)) {
        updateEvent(updatedEvent);
      } else {
        alert('This event conflicts with an existing event.');
        return;
      }
    } else {
      // Creating new event
      if (!checkForEventConflicts(eventData)) {
        addEvent(eventData);
      } else {
        alert('This event conflicts with an existing event.');
        return;
      }
    }

    handleCloseModal();
  };

  const handleDeleteEvent = () => {
    if (selectedEvent) {
      deleteEvent(selectedEvent.id);
      setShowEventDetails(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <CalendarHeader
        currentDate={currentDate}
        onPrev={handlePrevMonth}
        onNext={handleNextMonth}
        onToday={handleToday}
      />
      <CalendarGrid
        currentDate={currentDate}
        onDateClick={handleDateClick}
        onEventClick={handleEventClick}
      />
      {isModalOpen && (
        <EventModal
          selectedDate={selectedDate || new Date()}
          selectedEvent={selectedEvent}
          onSave={handleSaveEvent}
          onClose={handleCloseModal}
        />
      )}
      {showEventDetails && selectedEvent && (
        <EventDetails
          event={selectedEvent}
          onClose={handleCloseEventDetails}
          onEdit={handleEditEvent}
          onDelete={handleDeleteEvent}
        />
      )}
    </div>
  );
}