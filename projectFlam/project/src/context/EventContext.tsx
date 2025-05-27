import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { CalendarEvent, EventColor, RecurrenceType } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { addDays, isSameDay, format, addMonths, addWeeks, getDay } from 'date-fns';

interface EventContextType {
  events: CalendarEvent[];
  addEvent: (event: Omit<CalendarEvent, 'id'>) => void;
  updateEvent: (event: CalendarEvent) => void;
  deleteEvent: (id: string) => void;
  getEventsForDay: (date: Date) => CalendarEvent[];
  checkForEventConflicts: (event: Omit<CalendarEvent, 'id'>, excludeId?: string) => boolean;
  moveEvent: (eventId: string, newDate: Date) => void;
}

const EventContext = createContext<EventContextType | undefined>(undefined);

export function useEvents() {
  const context = useContext(EventContext);
  if (context === undefined) {
    throw new Error('useEvents must be used within an EventProvider');
  }
  return context;
}

interface EventProviderProps {
  children: ReactNode;
}

export function EventProvider({ children }: EventProviderProps) {
  const [events, setEvents] = useState<CalendarEvent[]>([]);

  // Load events from localStorage on component mount
  useEffect(() => {
    const savedEvents = localStorage.getItem('calendarEvents');
    if (savedEvents) {
      try {
        const parsedEvents = JSON.parse(savedEvents).map((event: any) => ({
          ...event,
          start: new Date(event.start),
          end: new Date(event.end),
          recurrence: {
            ...event.recurrence,
            endDate: event.recurrence.endDate ? new Date(event.recurrence.endDate) : undefined,
          },
        }));
        setEvents(parsedEvents);
      } catch (error) {
        console.error('Error parsing events from localStorage:', error);
      }
    }
  }, []);

  // Save events to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('calendarEvents', JSON.stringify(events));
  }, [events]);

  const addEvent = (event: Omit<CalendarEvent, 'id'>) => {
    const newEvent = { ...event, id: uuidv4() };
    setEvents((prevEvents) => [...prevEvents, newEvent]);
  };

  const updateEvent = (updatedEvent: CalendarEvent) => {
    setEvents((prevEvents) =>
      prevEvents.map((event) => (event.id === updatedEvent.id ? updatedEvent : event))
    );
  };

  const deleteEvent = (id: string) => {
    setEvents((prevEvents) => prevEvents.filter((event) => event.id !== id));
  };

  // Check for event conflicts (overlapping times on the same day)
  const checkForEventConflicts = (
    event: Omit<CalendarEvent, 'id'>,
    excludeId?: string
  ): boolean => {
    // Get all occurrences of recurring events
    const allEventsWithRecurrences = getAllEventOccurrences(
      events.filter((e) => e.id !== excludeId),
      new Date(),
      addMonths(new Date(), 6) // Look ahead 6 months for conflicts
    );

    // For the event being checked, get all its occurrences
    const newEventOccurrences = getEventOccurrences(
      { ...event, id: excludeId || 'temp-id' },
      new Date(),
      addMonths(new Date(), 6)
    );

    // Check each occurrence of the new event against all existing event occurrences
    for (const newOccurrence of newEventOccurrences) {
      for (const existingOccurrence of allEventsWithRecurrences) {
        if (
          isSameDay(newOccurrence.start, existingOccurrence.start) &&
          ((newOccurrence.start < existingOccurrence.end &&
            newOccurrence.start >= existingOccurrence.start) ||
            (newOccurrence.end > existingOccurrence.start &&
              newOccurrence.end <= existingOccurrence.end) ||
            (newOccurrence.start <= existingOccurrence.start &&
              newOccurrence.end >= existingOccurrence.end))
        ) {
          return true; // Conflict found
        }
      }
    }
    return false; // No conflicts
  };

  // Get all events for a specific day, including recurring events
  const getEventsForDay = (date: Date): CalendarEvent[] => {
    // Get non-recurring events for this day
    const nonRecurringEvents = events.filter(
      (event) =>
        event.recurrence.type === RecurrenceType.NONE && isSameDay(event.start, date)
    );

    // Get recurring events that occur on this day
    const recurringEvents = events.filter(
      (event) => event.recurrence.type !== RecurrenceType.NONE
    );

    const recurringEventsForDay: CalendarEvent[] = [];

    for (const event of recurringEvents) {
      // Determine if this recurring event occurs on the specified date
      const occurrences = getEventOccurrences(event, date, addDays(date, 1));
      
      for (const occurrence of occurrences) {
        if (isSameDay(occurrence.start, date)) {
          recurringEventsForDay.push(occurrence);
        }
      }
    }

    return [...nonRecurringEvents, ...recurringEventsForDay];
  };

  // Generate all occurrences of events between start and end dates
  const getAllEventOccurrences = (
    eventsToProcess: CalendarEvent[],
    start: Date,
    end: Date
  ): CalendarEvent[] => {
    let allOccurrences: CalendarEvent[] = [];

    for (const event of eventsToProcess) {
      const occurrences = getEventOccurrences(event, start, end);
      allOccurrences = [...allOccurrences, ...occurrences];
    }

    return allOccurrences;
  };

  // Generate all occurrences of a single event between start and end dates
  const getEventOccurrences = (
    event: CalendarEvent,
    start: Date,
    end: Date
  ): CalendarEvent[] => {
    if (event.recurrence.type === RecurrenceType.NONE) {
      // Non-recurring event
      if (event.start >= start && event.start < end) {
        return [event];
      }
      return [];
    }

    const occurrences: CalendarEvent[] = [];
    let currentDate = new Date(event.start);
    const eventDuration = event.end.getTime() - event.start.getTime();

    // If the recurring event has an end date and it's before our start date, return no occurrences
    if (
      event.recurrence.endDate &&
      event.recurrence.endDate < start
    ) {
      return [];
    }

    // Generate occurrences until we reach the end date
    while (currentDate < end && (!event.recurrence.endDate || currentDate <= event.recurrence.endDate)) {
      if (currentDate >= start) {
        occurrences.push({
          ...event,
          start: new Date(currentDate),
          end: new Date(currentDate.getTime() + eventDuration),
        });
      }

      // Calculate the next occurrence based on recurrence type
      switch (event.recurrence.type) {
        case RecurrenceType.DAILY:
          currentDate = addDays(currentDate, 1);
          break;
        case RecurrenceType.WEEKLY:
          if (event.recurrence.weekly && event.recurrence.weekly.daysOfWeek.length > 0) {
            // Get the next day of the week from the list
            const currentDayOfWeek = getDay(currentDate);
            const sortedDaysOfWeek = [...event.recurrence.weekly.daysOfWeek].sort((a, b) => a - b);
            
            // Find the next day of week
            const nextDayIndex = sortedDaysOfWeek.findIndex(day => day > currentDayOfWeek);
            
            if (nextDayIndex !== -1) {
              // There's a later day this week
              const daysToAdd = sortedDaysOfWeek[nextDayIndex] - currentDayOfWeek;
              currentDate = addDays(currentDate, daysToAdd);
            } else {
              // We need to go to the next week
              const daysToAdd = 7 - currentDayOfWeek + sortedDaysOfWeek[0];
              currentDate = addDays(currentDate, daysToAdd);
            }
          } else {
            // Default to once a week if no days specified
            currentDate = addWeeks(currentDate, 1);
          }
          break;
        case RecurrenceType.MONTHLY:
          currentDate = addMonths(currentDate, 1);
          break;
        case RecurrenceType.CUSTOM:
          if (event.recurrence.custom) {
            const { interval, unit } = event.recurrence.custom;
            if (unit === 'days') {
              currentDate = addDays(currentDate, interval);
            } else if (unit === 'weeks') {
              currentDate = addWeeks(currentDate, interval);
            } else if (unit === 'months') {
              currentDate = addMonths(currentDate, interval);
            }
          } else {
            // Default to daily if custom recurrence isn't properly defined
            currentDate = addDays(currentDate, 1);
          }
          break;
      }
    }

    return occurrences;
  };

  const moveEvent = (eventId: string, newDate: Date) => {
    setEvents((prevEvents) => {
      const eventIndex = prevEvents.findIndex((event) => event.id === eventId);
      if (eventIndex === -1) return prevEvents;

      const event = prevEvents[eventIndex];
      
      // Calculate the difference in days between the original date and new date
      const diffTime = newDate.getTime() - event.start.getTime();
      
      // Create new start and end dates by adding the time difference
      const newStart = new Date(event.start.getTime() + diffTime);
      const newEnd = new Date(event.end.getTime() + diffTime);

      // Create the updated event
      const updatedEvent = {
        ...event,
        start: newStart,
        end: newEnd,
      };

      // Check for conflicts
      if (checkForEventConflicts(updatedEvent, eventId)) {
        // If there's a conflict, return the original events array
        console.log("Conflict detected when moving event");
        return prevEvents;
      }

      // If no conflicts, update the event
      const updatedEvents = [...prevEvents];
      updatedEvents[eventIndex] = updatedEvent;
      return updatedEvents;
    });
  };

  const value = {
    events,
    addEvent,
    updateEvent,
    deleteEvent,
    getEventsForDay,
    checkForEventConflicts,
    moveEvent,
  };

  return <EventContext.Provider value={value}>{children}</EventContext.Provider>;
}