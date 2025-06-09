import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useMonth } from '@/contexts/MonthContext';

export function MonthNavigation() {
  const { currentMonthLabel, navigateMonth } = useMonth();

  return (
    <div className="flex items-center justify-center gap-4 mb-6">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigateMonth('prev')}
        className="text-pink-600 hover:text-pink-700 hover:bg-pink-50"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      
      <h2 className="text-lg font-semibold text-gray-800 capitalize min-w-[140px] text-center">
        {currentMonthLabel}
      </h2>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigateMonth('next')}
        className="text-pink-600 hover:text-pink-700 hover:bg-pink-50"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}