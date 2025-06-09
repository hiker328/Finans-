import { useState } from 'react';
import { Navigation } from '@/components/Navigation';
import { Dashboard } from '@/components/Dashboard';
import { Income } from '@/components/Income';
import { Expenses } from '@/components/Expenses';
import { CategoriesAndTransactions } from '@/components/CategoriesAndTransactions';
import { SavingsGoals } from '@/components/SavingsGoals';
import { MonthProvider } from '@/contexts/MonthContext';
import { Toaster } from '@/components/ui/sonner';

function App() {
  const [currentView, setCurrentView] = useState('dashboard');

  const renderCurrentView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard />;
      case 'income':
        return <Income />;
      case 'expenses':
        return <Expenses />;
      case 'categories':
        return <CategoriesAndTransactions />;
      case 'savings':
        return <SavingsGoals />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <MonthProvider>
      <div className="flex h-screen bg-gray-50">
        <Navigation currentView={currentView} onViewChange={setCurrentView} />
        
        <div className="flex-1 md:ml-64">
          <main className="flex-1 relative overflow-y-auto focus:outline-none">
            {renderCurrentView()}
          </main>
        </div>
        
        <Toaster />
      </div>
    </MonthProvider>
  );
}

export default App;