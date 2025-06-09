import React, { createContext, useContext, useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface MonthContextType {
  currentDate: Date;
  setCurrentDate: (date: Date) => void;
  currentMonthLabel: string;
  navigateMonth: (direction: 'prev' | 'next') => void;
}

const MonthContext = createContext<MonthContextType | undefined>(undefined);

export function MonthProvider({ children }: { children: React.ReactNode }) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const currentMonthLabel = format(currentDate, 'MMMM yyyy', { locale: ptBR });

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + (direction === 'next' ? 1 : -1));
      return newDate;
    });
  };

  return (
    <MonthContext.Provider value={{
      currentDate,
      setCurrentDate,
      currentMonthLabel,
      navigateMonth
    }}>
      {children}
    </MonthContext.Provider>
  );
}

export function useMonth() {
  const context = useContext(MonthContext);
  if (context === undefined) {
    throw new Error('useMonth must be used within a MonthProvider');
  }
  return context;
}