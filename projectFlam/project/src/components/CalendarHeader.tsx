import React from 'react';
import { format } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CalendarHeaderProps {
  currentDate: Date;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
}

export function CalendarHeader({ currentDate, onPrev, onNext, onToday }: CalendarHeaderProps) {
  return (
    <div className="bg-white px-4 py-4 border-b border-gray-200">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-800">
          {format(currentDate, 'MMMM yyyy')}
        </h2>
        <div className="flex space-x-2">
          <button
            onClick={onToday}
            className="px-4 py-2 bg-white text-primary-600 border border-gray-300 rounded-md shadow-sm text-sm font-medium hover:bg-gray-50 transition duration-150"
          >
            Today
          </button>
          <div className="flex border border-gray-300 rounded-md overflow-hidden">
            <button
              onClick={onPrev}
              className="p-2 bg-white text-gray-700 hover:bg-gray-50 transition duration-150"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={onNext}
              className="p-2 bg-white text-gray-700 hover:bg-gray-50 transition duration-150"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}