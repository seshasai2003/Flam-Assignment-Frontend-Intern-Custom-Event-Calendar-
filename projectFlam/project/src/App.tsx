import React from 'react';
import { EventProvider } from './context/EventContext';
import { CalendarContainer } from './components/CalendarContainer';
import { Calendar } from 'lucide-react';

function App() {
  return (
    <EventProvider>
      <div className="min-h-screen bg-gray-50">
        <header className="bg-primary-600 text-white p-4 shadow-md">
          <div className="container mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Calendar className="h-6 w-6" />
              <h1 className="text-xl font-semibold">Event Calendar</h1>
            </div>
          </div>
        </header>
        <main className="container mx-auto p-4 md:p-6">
          <CalendarContainer />
        </main>
      </div>
    </EventProvider>
  );
}

export default App;