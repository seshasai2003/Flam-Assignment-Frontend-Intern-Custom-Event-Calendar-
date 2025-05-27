import { CalendarEvent, Recurrence, RecurrenceType } from '../types';
import { addDays, addWeeks, addMonths, getDay, isSameDay, isBefore } from 'date-fns';

// Get next occurrence of a recurring event
export const getNextOccurrence = (event: CalendarEvent, afterDate: Date): Date | null => {
  if (event.recurrence.type === RecurrenceType.NONE) {
    return null;
  }
  
  let currentDate = new Date(event.start);
  const eventDuration = event.end.getTime() - event.start.getTime();
  
  // If the event's end date is set and it's before the afterDate, no more occurrences
  if (
    event.recurrence.endDate &&
    isBefore(event.recurrence.endDate, afterDate)
  ) {
    return null;
  }
  
  // Find the next occurrence after the specified date
  while (isBefore(currentDate, afterDate)) {
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
        }
        break;
    }
  }
  
  return currentDate;
};

// Check if an event occurs on a specific date
export const eventOccursOnDate = (event: CalendarEvent, date: Date): boolean => {
  // For non-recurring events, simply check if it's on the same day
  if (event.recurrence.type === RecurrenceType.NONE) {
    return isSameDay(event.start, date);
  }
  
  // For recurring events, we need to check if the date is a valid occurrence
  let currentDate = new Date(event.start);
  const dateToCheck = new Date(date);
  
  // If the event has an end date and the date to check is after it, return false
  if (
    event.recurrence.endDate &&
    isBefore(event.recurrence.endDate, dateToCheck)
  ) {
    return false;
  }
  
  // If the date to check is before the first occurrence, return false
  if (isBefore(dateToCheck, currentDate)) {
    return false;
  }
  
  // Check occurrences until we either find a match or go past the date
  while (!isBefore(dateToCheck, currentDate)) {
    if (isSameDay(currentDate, dateToCheck)) {
      return true;
    }
    
    // Calculate the next occurrence
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
        }
        break;
    }
    
    // If we've gone past the date to check, break out of the loop
    if (isBefore(dateToCheck, currentDate)) {
      return false;
    }
  }
  
  return false;
};