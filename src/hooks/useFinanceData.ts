import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useMonth } from '@/contexts/MonthContext';
import { format, addMonths, startOfMonth } from 'date-fns';

export interface Category {
  id: string;
  name: string;
  monthly_limit: number;
  color: string;
  spent?: number;
}

export interface Income {
  id: string;
  description: string;
  amount: number;
  date: string;
  is_recurring: boolean;
  recurring_day: number | null;
  active: boolean;
}

export interface Expense {
  id: string;
  name: string;
  amount: number;
  due_date: string;
  is_recurring: boolean;
  recurrence_count: number;
  current_recurrence: number;
  was_paid: boolean;
  paid_at: string | null;
  category_id: string | null;
}

export interface Transaction {
  id: string;
  category_id: string;
  amount: number;
  description: string;
  date: string;
  category?: Category;
}

export interface SavingsGoal {
  id: string;
  name: string;
  goal_amount: number;
  current_amount: number;
  deadline: string | null;
}

export function useFinanceData() {
  const { currentDate } = useMonth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [income, setIncome] = useState<Income[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>([]);
  const [loading, setLoading] = useState(false);

  const currentMonth = format(currentDate, 'yyyy-MM');
  const currentMonthStart = format(startOfMonth(currentDate), 'yyyy-MM-dd');
  const nextMonthStart = format(startOfMonth(addMonths(currentDate, 1)), 'yyyy-MM-dd');

  useEffect(() => {
    // Only fetch data if we have valid Supabase configuration
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    if (supabaseUrl && supabaseKey && supabaseUrl !== 'your_supabase_url' && supabaseKey !== 'your_supabase_anon_key') {
      fetchAllData();
    } else {
      // Set mock data for demo purposes
      setMockData();
    }
  }, [currentDate]);

  const setMockData = () => {
    setCategories([
      { id: '1', name: 'Mercado', monthly_limit: 800, color: '#F63D68', spent: 450 },
      { id: '2', name: 'Transporte', monthly_limit: 400, color: '#FEA3B4', spent: 320 },
      { id: '3', name: 'Lazer', monthly_limit: 300, color: '#FFE4E8', spent: 180 },
      { id: '4', name: 'Restaurantes', monthly_limit: 500, color: '#F63D68', spent: 280 },
      { id: '5', name: 'Saúde', monthly_limit: 200, color: '#FEA3B4', spent: 150 },
      { id: '6', name: 'Educação', monthly_limit: 150, color: '#FFE4E8', spent: 100 }
    ]);

    setIncome([
      { id: '1', description: 'Salário', amount: 5000, date: '2024-01-05', is_recurring: true, recurring_day: 5, active: true },
      { id: '2', description: 'Freelance', amount: 1200, date: '2024-01-15', is_recurring: false, recurring_day: null, active: true }
    ]);

    setExpenses([
      { id: '1', name: 'Aluguel', amount: 1500, due_date: '2024-01-10', is_recurring: true, recurrence_count: 0, current_recurrence: 1, was_paid: true, paid_at: '2024-01-10', category_id: null },
      { id: '2', name: 'Conta de Luz', amount: 180, due_date: '2024-01-15', is_recurring: true, recurrence_count: 0, current_recurrence: 1, was_paid: false, paid_at: null, category_id: null },
      { id: '3', name: 'Internet', amount: 120, due_date: '2024-01-20', is_recurring: true, recurrence_count: 0, current_recurrence: 1, was_paid: false, paid_at: null, category_id: null }
    ]);

    setTransactions([
      { id: '1', category_id: '1', amount: 150, description: 'Supermercado', date: '2024-01-08' },
      { id: '2', category_id: '2', amount: 50, description: 'Uber', date: '2024-01-09' },
      { id: '3', category_id: '3', amount: 80, description: 'Cinema', date: '2024-01-12' }
    ]);

    setSavingsGoals([
      { id: '1', name: 'Viagem', goal_amount: 5000, current_amount: 2500, deadline: '2024-12-31' },
      { id: '2', name: 'Emergência', goal_amount: 10000, current_amount: 3200, deadline: null },
      { id: '3', name: 'Carro Novo', goal_amount: 30000, current_amount: 8500, deadline: '2025-06-30' }
    ]);

    setLoading(false);
  };

  const fetchAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchCategories(),
        fetchIncome(),
        fetchExpenses(),
        fetchTransactions(),
        fetchSavingsGoals()
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
      // Fallback to mock data if there's an error
      setMockData();
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    const { data } = await supabase
      .from('categories')
      .select('*')
      .order('name');
    
    if (data) {
      // Calculate spent amount for each category
      const categoriesWithSpent = await Promise.all(
        data.map(async (category) => {
          // Buscar transações da categoria
          const { data: categoryTransactions } = await supabase
            .from('transactions')
            .select('amount')
            .eq('category_id', category.id)
            .gte('date', currentMonthStart)
            .lt('date', nextMonthStart);
          
          // Buscar despesas pagas da categoria
          const { data: categoryExpenses } = await supabase
            .from('expenses')
            .select('amount')
            .eq('category_id', category.id)
            .eq('was_paid', true)
            .gte('due_date', currentMonthStart)
            .lt('due_date', nextMonthStart);
          
          const transactionsSpent = categoryTransactions?.reduce((sum, t) => sum + t.amount, 0) || 0;
          const expensesSpent = categoryExpenses?.reduce((sum, e) => sum + e.amount, 0) || 0;
          const spent = transactionsSpent + expensesSpent;
          
          return { ...category, spent };
        })
      );
      
      setCategories(categoriesWithSpent);
    }
  };

  const fetchIncome = async () => {
    const { data } = await supabase
      .from('income')
      .select('*')
      .eq('active', true)
      .order('date', { ascending: false });
    
    if (data) {
      // Filter for current month including recurring income
      const filteredIncome = data.filter(income => {
        if (income.is_recurring) return true;
        return income.date.startsWith(currentMonth);
      });
      setIncome(filteredIncome);
    }
  };

  const fetchExpenses = async () => {
    // Buscar despesas do mês atual
    const { data: currentMonthExpenses } = await supabase
      .from('expenses')
      .select('*')
      .gte('due_date', currentMonthStart)
      .lt('due_date', nextMonthStart)
      .order('due_date');

    // Buscar despesas recorrentes de meses anteriores que ainda devem aparecer
    const { data: recurringExpenses } = await supabase
      .from('expenses')
      .select('*')
      .eq('is_recurring', true)
      .lt('due_date', currentMonthStart)
      .order('due_date');

              let allExpenses = [...(currentMonthExpenses || [])];

     // Processar despesas recorrentes para gerar as do mês atual
     if (recurringExpenses) {
       for (const expense of recurringExpenses) {
         // Se é recorrente infinita (recurrence_count = 0) ou ainda tem parcelas restantes
         if (expense.recurrence_count === 0 || expense.current_recurrence < expense.recurrence_count) {
           // Calcular quantos meses se passaram desde a despesa original
           const originalDate = new Date(expense.due_date);
           const currentYear = currentDate.getFullYear();
           const currentMonth = currentDate.getMonth();
           
           // Calcular a diferença em meses
           const monthsDiff = (currentYear - originalDate.getFullYear()) * 12 + (currentMonth - originalDate.getMonth());
           
           // Se passou pelo menos 1 mês, calcular qual seria a próxima parcela
           if (monthsDiff > 0) {
             const nextRecurrence = expense.current_recurrence + monthsDiff;
             
             // Só criar se ainda não atingiu o limite de parcelas (para parcelamentos finitos)
             if (expense.recurrence_count === 0 || nextRecurrence <= expense.recurrence_count) {
               // Criar nova data para o mês atual mantendo o dia
               const newDueDate = new Date(currentYear, currentMonth, originalDate.getDate());
               
               // Se a data é válida e está no mês atual
               if (newDueDate.getMonth() === currentMonth && newDueDate >= new Date(currentMonthStart) && newDueDate < new Date(nextMonthStart)) {
                 // Verificar se já não existe uma despesa para este mês
                 const existsInCurrentMonth = allExpenses.some(e => 
                   e.name === expense.name && 
                   new Date(e.due_date).getMonth() === currentMonth &&
                   new Date(e.due_date).getFullYear() === currentYear
                 );

                 if (!existsInCurrentMonth) {
                   // Criar nova instância da despesa para o mês atual
                   const newExpense = {
                     ...expense,
                     id: `${expense.id}_${currentYear}_${currentMonth}`, // ID único para o mês
                     due_date: newDueDate.toISOString().split('T')[0],
                     was_paid: false,
                     paid_at: null,
                     current_recurrence: nextRecurrence
                   };
                   
                   allExpenses.push(newExpense);
                 }
               }
             }
           }
         }
       }
     }

    if (allExpenses) setExpenses(allExpenses);
  };

  const fetchTransactions = async () => {
    const { data } = await supabase
      .from('transactions')
      .select(`
        *,
        categories (
          name,
          color
        )
      `)
      .gte('date', currentMonthStart)
      .lt('date', nextMonthStart)
      .order('date', { ascending: false });
    
    if (data) {
      const formattedTransactions = data.map(t => ({
        ...t,
        category: t.categories ? {
          id: t.category_id,
          name: t.categories.name,
          color: t.categories.color,
          monthly_limit: 0
        } : undefined
      }));
      setTransactions(formattedTransactions);
    }
  };

  const fetchSavingsGoals = async () => {
    const { data } = await supabase
      .from('savings_goals')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (data) setSavingsGoals(data);
  };

  // Calculate summary values
  const totalIncome = income.reduce((sum, i) => sum + i.amount, 0);
  const totalExpenses = expenses.filter(e => e.was_paid).reduce((sum, e) => sum + e.amount, 0);
  const totalTransactions = transactions.reduce((sum, t) => sum + t.amount, 0);
  const pendingExpenses = expenses.filter(e => !e.was_paid).reduce((sum, e) => sum + e.amount, 0);
  const availableBalance = totalIncome - totalExpenses - totalTransactions - pendingExpenses;

  return {
    categories,
    income,
    expenses,
    transactions,
    savingsGoals,
    loading,
    summary: {
      totalIncome,
      totalExpenses,
      totalTransactions,
      pendingExpenses,
      availableBalance,
      totalSpent: totalExpenses + totalTransactions
    },
    refresh: fetchAllData,
    refreshCategories: fetchCategories,
    refreshIncome: fetchIncome,
    refreshExpenses: fetchExpenses,
    refreshTransactions: fetchTransactions,
    refreshSavingsGoals: fetchSavingsGoals
  };
}