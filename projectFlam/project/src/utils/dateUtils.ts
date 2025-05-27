import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  addDays,
  addWeeks,
  addMonths,
  getDay,
  isSameDay,
  format,
} from 'date-fns';

// Get array of days for a month view (including days from prev/next month to fill grid)
export const getCalendarDays = (date: Date): Date[] => {
  const monthStart = startOfMonth(date);
  const monthEnd = endOfMonth(monthStart);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  
  return eachDayOfInterval({
    start: calendarStart,
    end: calendarEnd,
  });
};

// Format date to a readable string
export const formatDate = (date: Date, formatString: string): string => {
  return format(date, formatString);
};

// Check if date is today
export const isDateToday = (date: Date): boolean => {
  return isSameDay(date, new Date());
};