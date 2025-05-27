export enum RecurrenceType {
  NONE = 'none',
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  CUSTOM = 'custom',
}

export interface WeeklyRecurrence {
  daysOfWeek: number[]; // 0-6, where 0 is Sunday
}

export interface CustomRecurrence {
  interval: number; // Every X days/weeks/months
  unit: 'days' | 'weeks' | 'months';
}

export interface Recurrence {
  type: RecurrenceType;
  endDate?: Date;
  weekly?: WeeklyRecurrence;
  custom?: CustomRecurrence;
}

export type EventColor = 'blue' | 'green' | 'red' | 'purple' | 'yellow' | 'teal';

export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  description?: string;
  color: EventColor;
  recurrence: Recurrence;
}

export interface DragItem {
  eventId: string;
  originalDate: Date;
}