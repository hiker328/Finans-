import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { PiggyBank, TrendingUp, AlertTriangle, Wallet, BarChart3, PieChart } from 'lucide-react';
import { useFinanceData } from '@/hooks/useFinanceData';
import { MonthNavigation } from './MonthNavigation';
import { format, isBefore, addDays } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell } from 'recharts';

export function Dashboard() {
  const { summary, expenses, savingsGoals, categories, loading } = useFinanceData();

  if (loading) {
    return (
      <div className="p-6">
        <MonthNavigation />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-3">
                <div className="h-4 bg-gray-200 rounded w-24"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded w-32 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-16"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const overduePendencies = expenses.filter(expense => 
    !expense.was_paid && isBefore(new Date(expense.due_date), new Date())
  );

  const upcomingPendencies = expenses.filter(expense => 
    !expense.was_paid && 
    !isBefore(new Date(expense.due_date), new Date()) &&
    isBefore(new Date(expense.due_date), addDays(new Date(), 7))
  );

  const totalSavingsGoal = savingsGoals.reduce((sum, goal) => sum + goal.goal_amount, 0);
  const totalSaved = savingsGoals.reduce((sum, goal) => sum + goal.current_amount, 0);
  const savingsProgress = totalSavingsGoal > 0 ? (totalSaved / totalSavingsGoal) * 100 : 0;

  return (
    <div className="p-4 md:p-6 space-y-6">
      <MonthNavigation />
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <Card className="bg-gradient-to-br from-pink-50 to-pink-100 border-pink-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-pink-700 flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Receitas do Mês
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-pink-800">
              R$ {summary.totalIncome.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-purple-700 flex items-center gap-2">
              <Wallet className="h-4 w-4" />
              Gastos Realizados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-800">
              R$ {summary.totalSpent.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-orange-700 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Pendências
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-800">
              R$ {summary.pendingExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>

        <Card className={`bg-gradient-to-br ${summary.availableBalance >= 0 ? 'from-green-50 to-green-100 border-green-200' : 'from-red-50 to-red-100 border-red-200'}`}>
          <CardHeader className="pb-3">
            <CardTitle className={`text-sm font-medium ${summary.availableBalance >= 0 ? 'text-green-700' : 'text-red-700'} flex items-center gap-2`}>
              <PiggyBank className="h-4 w-4" />
              Saldo Disponível
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${summary.availableBalance >= 0 ? 'text-green-800' : 'text-red-800'}`}>
              R$ {summary.availableBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts and Savings Goals */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Alerts Card */}
        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
          <CardHeader>
            <CardTitle className="text-yellow-800 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Alertas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {overduePendencies.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium text-red-700">Pendências Vencidas:</h4>
                {overduePendencies.slice(0, 3).map(expense => (
                  <div key={expense.id} className="flex justify-between items-center">
                    <span className="text-sm text-red-600">{expense.name}</span>
                    <Badge variant="destructive" className="text-xs">
                      {format(new Date(expense.due_date), 'dd/MM')}
                    </Badge>
                  </div>
                ))}
                {overduePendencies.length > 3 && (
                  <p className="text-xs text-red-500">
                    +{overduePendencies.length - 3} outras pendências vencidas
                  </p>
                )}
              </div>
            )}

            {upcomingPendencies.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium text-orange-700">Próximos Vencimentos:</h4>
                {upcomingPendencies.slice(0, 3).map(expense => (
                  <div key={expense.id} className="flex justify-between items-center">
                    <span className="text-sm text-orange-600">{expense.name}</span>
                    <Badge variant="secondary" className="text-xs">
                      {format(new Date(expense.due_date), 'dd/MM')}
                    </Badge>
                  </div>
                ))}
              </div>
            )}

            {overduePendencies.length === 0 && upcomingPendencies.length === 0 && (
              <p className="text-sm text-yellow-700">Nenhum alerta no momento! 🎉</p>
            )}
          </CardContent>
        </Card>

        {/* Savings Goals Summary */}
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardHeader>
            <CardTitle className="text-green-800 flex items-center gap-2">
              <PiggyBank className="h-5 w-5" />
              Metas de Poupança
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-green-700">Total das Metas:</span>
              <span className="font-semibold text-green-800">
                R$ {totalSavingsGoal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-green-700">Total Poupado:</span>
              <span className="font-semibold text-green-800">
                R$ {totalSaved.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-green-700">Progresso Geral:</span>
                <span className="text-sm font-medium text-green-800">
                  {savingsProgress.toFixed(1)}%
                </span>
              </div>
              <Progress value={savingsProgress} className="h-2" />
            </div>

            {savingsGoals.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium text-green-700 text-sm">Metas Ativas:</h4>
                {savingsGoals.slice(0, 2).map(goal => {
                  const progress = (goal.current_amount / goal.goal_amount) * 100;
                  return (
                    <div key={goal.id} className="space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-green-600">{goal.name}</span>
                        <span className="text-xs text-green-600">
                          {progress.toFixed(0)}%
                        </span>
                      </div>
                      <Progress value={progress} className="h-1" />
                    </div>
                  );
                })}
                {savingsGoals.length > 2 && (
                  <p className="text-xs text-green-500">
                    +{savingsGoals.length - 2} outras metas
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Income vs Expenses Chart */}
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-100 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-800 flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Receitas vs Gastos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={[
                  {
                    name: 'Receitas',
                    valor: summary.totalIncome,
                    fill: '#10B981'
                  },
                  {
                    name: 'Gastos',
                    valor: summary.totalSpent,
                    fill: '#EF4444'
                  },
                  {
                    name: 'Pendências',
                    valor: summary.pendingExpenses,
                    fill: '#F59E0B'
                  }
                ]}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis tickFormatter={(value) => `R$ ${value.toLocaleString('pt-BR')}`} />
                <Tooltip 
                  formatter={(value: number) => [`R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 'Valor']}
                />
                <Bar dataKey="valor" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Expenses by Category Chart */}
        <Card className="bg-gradient-to-br from-purple-50 to-pink-100 border-purple-200">
          <CardHeader>
            <CardTitle className="text-purple-800 flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Gastos por Categoria
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsPieChart>
                <Tooltip 
                  formatter={(value: number) => [`R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 'Gasto']}
                />
                <Pie
                  data={categories
                    .filter(cat => cat.spent && cat.spent > 0)
                    .map(cat => ({
                      name: cat.name,
                      value: cat.spent,
                      fill: cat.color
                    }))
                  }
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                >
                  {categories
                    .filter(cat => cat.spent && cat.spent > 0)
                    .map((cat, index) => (
                      <Cell key={`cell-${index}`} fill={cat.color} />
                    ))
                  }
                </Pie>
              </RechartsPieChart>
            </ResponsiveContainer>
            
            {/* Legend */}
            <div className="mt-4 grid grid-cols-2 gap-2">
              {categories
                .filter(cat => cat.spent && cat.spent > 0)
                .map(cat => (
                  <div key={cat.id} className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: cat.color }}
                    />
                    <span className="text-xs text-gray-600 truncate">
                      {cat.name}: R$ {cat.spent!.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                ))
              }
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}