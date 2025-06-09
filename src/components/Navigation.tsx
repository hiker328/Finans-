import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Home, TrendingUp, CreditCard, ShoppingCart, PiggyBank, Menu } from 'lucide-react';

interface NavigationProps {
  currentView: string;
  onViewChange: (view: string) => void;
}

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: Home },
  { id: 'income', label: 'Receitas', icon: TrendingUp },
  { id: 'expenses', label: 'Despesas', icon: CreditCard },
  { id: 'categories', label: 'Categorias', icon: ShoppingCart },
  { id: 'savings', label: 'Metas', icon: PiggyBank },
];

export function Navigation({ currentView, onViewChange }: NavigationProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleNavigation = (view: string) => {
    onViewChange(view);
    setIsOpen(false);
  };

  const NavContent = () => (
    <nav className="space-y-2">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = currentView === item.id;
        
        return (
          <Button
            key={item.id}
            variant={isActive ? "default" : "ghost"}
            className={`w-full justify-start gap-2 ${
              isActive 
                ? "bg-pink-600 hover:bg-pink-700 text-white" 
                : "text-gray-700 hover:text-pink-600 hover:bg-pink-50"
            }`}
            onClick={() => handleNavigation(item.id)}
          >
            <Icon className="h-5 w-5" />
            {item.label}
          </Button>
        );
      })}
    </nav>
  );

  return (
    <>
      {/* Desktop Navigation */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 bg-white border-r border-gray-200">
        <div className="flex flex-col flex-1 min-h-0">
          <div className="flex items-center h-16 flex-shrink-0 px-4 bg-gradient-to-r from-pink-600 to-purple-600">
            <PiggyBank className="h-8 w-8 text-white mr-3" />
            <h1 className="text-xl font-bold text-white">FinanSá</h1>
          </div>
          <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
            <div className="flex-1 px-3 space-y-1">
              <NavContent />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden">
        <div className="flex items-center justify-between h-16 px-4 bg-gradient-to-r from-pink-600 to-purple-600">
          <div className="flex items-center">
            <PiggyBank className="h-8 w-8 text-white mr-3" />
            <h1 className="text-xl font-bold text-white">FinanSá</h1>
          </div>
          
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="text-white hover:bg-pink-700">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <div className="flex items-center h-16 px-4 bg-gradient-to-r from-pink-600 to-purple-600">
                <PiggyBank className="h-8 w-8 text-white mr-3" />
                <h1 className="text-xl font-bold text-white">FinanSá</h1>
              </div>
              <div className="pt-5 pb-4 px-3">
                <NavContent />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </>
  );
}