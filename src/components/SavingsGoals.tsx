import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Plus, PiggyBank, Edit, Trash2, Target, Calendar, DollarSign } from 'lucide-react';
import { useFinanceData, type SavingsGoal } from '@/hooks/useFinanceData';
import { MonthNavigation } from './MonthNavigation';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { format, differenceInDays } from 'date-fns';

export function SavingsGoals() {
  const { savingsGoals, loading, refreshSavingsGoals } = useFinanceData();
  const { toast } = useToast();
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [showAddAmount, setShowAddAmount] = useState(false);
  const [editingGoal, setEditingGoal] = useState<string | null>(null);
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    goal_amount: '',
    current_amount: '',
    deadline: ''
  });
  const [addAmountData, setAddAmountData] = useState({
    amount: ''
  });

  const resetForm = () => {
    setFormData({
      name: '',
      goal_amount: '',
      current_amount: '',
      deadline: ''
    });
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.goal_amount) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive"
      });
      return;
    }

    const data = {
      name: formData.name,
      goal_amount: parseFloat(formData.goal_amount),
      current_amount: parseFloat(formData.current_amount) || 0,
      deadline: formData.deadline || null
    };

    let error;
    if (editingGoal) {
      ({ error } = await supabase
        .from('savings_goals')
        .update(data)
        .eq('id', editingGoal));
    } else {
      ({ error } = await supabase
        .from('savings_goals')
        .insert(data));
    }

    if (error) {
      toast({
        title: "Erro",
        description: `Erro ao ${editingGoal ? 'atualizar' : 'adicionar'} meta`,
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Sucesso",
      description: `Meta ${editingGoal ? 'atualizada' : 'adicionada'} com sucesso!`
    });

    resetForm();
    setShowAddGoal(false);
    setEditingGoal(null);
    refreshSavingsGoals();
  };

  const handleEdit = (goal: SavingsGoal) => {
    setFormData({
      name: goal.name,
      goal_amount: goal.goal_amount.toString(),
      current_amount: goal.current_amount.toString(),
      deadline: goal.deadline || ''
    });
    setEditingGoal(goal.id);
    setShowAddGoal(true);
  };

  const handleDelete = async (goalId: string) => {
    const { error } = await supabase
      .from('savings_goals')
      .delete()
      .eq('id', goalId);

    if (error) {
      toast({
        title: "Erro",
        description: "Erro ao excluir meta",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Sucesso",
      description: "Meta excluída com sucesso!"
    });

    refreshSavingsGoals();
  };

  const handleAddAmount = async () => {
    if (!addAmountData.amount || !selectedGoal) {
      toast({
        title: "Erro",
        description: "Digite um valor válido",
        variant: "destructive"
      });
      return;
    }

    const goal = savingsGoals.find(g => g.id === selectedGoal);
    if (!goal) return;

    const newAmount = goal.current_amount + parseFloat(addAmountData.amount);

    const { error } = await supabase
      .from('savings_goals')
      .update({ current_amount: newAmount })
      .eq('id', selectedGoal);

    if (error) {
      toast({
        title: "Erro",
        description: "Erro ao adicionar valor à meta",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Sucesso",
      description: "Valor adicionado à meta com sucesso!"
    });

    setAddAmountData({ amount: '' });
    setShowAddAmount(false);
    setSelectedGoal(null);
    refreshSavingsGoals();
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 100) return 'bg-green-500';
    if (percentage >= 75) return 'bg-blue-500';
    if (percentage >= 50) return 'bg-yellow-500';
    return 'bg-pink-500';
  };

  const getDaysToDeadline = (deadline: string | null) => {
    if (!deadline) return null;
    return differenceInDays(new Date(deadline), new Date());
  };

  const totalGoalAmount = savingsGoals.reduce((sum, goal) => sum + goal.goal_amount, 0);
  const totalSaved = savingsGoals.reduce((sum, goal) => sum + goal.current_amount, 0);
  const overallProgress = totalGoalAmount > 0 ? (totalSaved / totalGoalAmount) * 100 : 0;

  if (loading) {
    return (
      <div className="p-6">
        <MonthNavigation />
        <div className="space-y-4">
          <Card className="animate-pulse">
            <CardHeader>
              <div className="h-6 bg-gray-200 rounded w-32"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded w-48"></div>
            </CardContent>
          </Card>
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-2 bg-gray-200 rounded w-full"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <MonthNavigation />

      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Metas de Poupança</h1>
        
        <Dialog open={showAddGoal} onOpenChange={(open) => {
          setShowAddGoal(open);
          if (!open) {
            resetForm();
            setEditingGoal(null);
          }
        }}>
          <DialogTrigger asChild>
            <Button className="bg-pink-600 hover:bg-pink-700 text-white">
              <Plus className="h-4 w-4 mr-2" />
              Nova Meta
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingGoal ? 'Editar Meta' : 'Adicionar Nova Meta'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Nome da Meta</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Viagem, emergência, carro novo..."
                />
              </div>

              <div>
                <Label htmlFor="goal_amount">Valor Objetivo</Label>
                <Input
                  id="goal_amount"
                  type="number"
                  step="0.01"
                  value={formData.goal_amount}
                  onChange={(e) => setFormData(prev => ({ ...prev, goal_amount: e.target.value }))}
                  placeholder="0,00"
                />
              </div>

              <div>
                <Label htmlFor="current_amount">Valor Atual (opcional)</Label>
                <Input
                  id="current_amount"
                  type="number"
                  step="0.01"
                  value={formData.current_amount}
                  onChange={(e) => setFormData(prev => ({ ...prev, current_amount: e.target.value }))}
                  placeholder="0,00"
                />
              </div>

              <div>
                <Label htmlFor="deadline">Prazo (opcional)</Label>
                <Input
                  id="deadline"
                  type="date"
                  value={formData.deadline}
                  onChange={(e) => setFormData(prev => ({ ...prev, deadline: e.target.value }))}
                />
              </div>

              <Button onClick={handleSubmit} className="w-full bg-pink-600 hover:bg-pink-700">
                {editingGoal ? 'Atualizar Meta' : 'Adicionar Meta'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Overall Progress Card */}
      <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
        <CardHeader>
          <CardTitle className="text-purple-800 flex items-center gap-2">
            <Target className="h-5 w-5" />
            Progresso Geral das Metas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-purple-700">Total das Metas:</span>
            <span className="font-semibold text-purple-900">
              R$ {totalGoalAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-purple-700">Total Poupado:</span>
            <span className="font-semibold text-purple-900">
              R$ {totalSaved.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-purple-700">Progresso:</span>
              <span className="text-sm font-medium text-purple-900">
                {overallProgress.toFixed(1)}%
              </span>
            </div>
            <Progress value={overallProgress} className="h-3" />
          </div>
        </CardContent>
      </Card>

      {/* Goals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {savingsGoals.length === 0 ? (
          <div className="col-span-full">
            <Card>
              <CardContent className="p-8 text-center">
                <PiggyBank className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Nenhuma meta de poupança cadastrada ainda.</p>
                <p className="text-sm text-gray-400 mt-1">
                  Defina suas metas para começar a poupar de forma organizada!
                </p>
              </CardContent>
            </Card>
          </div>
        ) : (
          savingsGoals.map(goal => {
            const progress = (goal.current_amount / goal.goal_amount) * 100;
            const daysToDeadline = getDaysToDeadline(goal.deadline);
            const isOverdue = daysToDeadline !== null && daysToDeadline < 0;
            const isNearDeadline = daysToDeadline !== null && daysToDeadline <= 30 && daysToDeadline > 0;
            
            return (
              <Card key={goal.id} className="hover:shadow-lg transition-shadow bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-green-800 flex items-center gap-2 text-lg">
                        <PiggyBank className="h-5 w-5" />
                        {goal.name}
                      </CardTitle>
                      {goal.deadline && (
                        <div className="mt-2">
                          <Badge 
                            variant={isOverdue ? "destructive" : isNearDeadline ? "secondary" : "default"}
                            className="text-xs"
                          >
                            <Calendar className="h-3 w-3 mr-1" />
                            {isOverdue 
                              ? `${Math.abs(daysToDeadline!)} dias atrasado`
                              : daysToDeadline === 0 
                                ? 'Hoje!'
                                : daysToDeadline === 1
                                  ? 'Amanhã'
                                  : `${daysToDeadline} dias`
                            }
                          </Badge>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(goal)}
                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(goal.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-green-700">Objetivo:</span>
                      <span className="font-semibold text-green-900">
                        R$ {goal.goal_amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-green-700">Poupado:</span>
                      <span className="font-semibold text-green-900">
                        R$ {goal.current_amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-green-700">Faltam:</span>
                      <span className="font-semibold text-green-900">
                        R$ {(goal.goal_amount - goal.current_amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-green-700">Progresso:</span>
                        <span className="text-sm font-medium text-green-900">
                          {progress.toFixed(1)}%
                        </span>
                      </div>
                      
                      <div className="relative">
                        <Progress value={Math.min(progress, 100)} className="h-3" />
                        <div 
                          className={`absolute top-0 left-0 h-3 rounded-full transition-colors ${getProgressColor(progress)}`}
                          style={{ width: `${Math.min(progress, 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {goal.deadline && (
                    <p className="text-xs text-green-600 text-center">
                      Prazo: {format(new Date(goal.deadline), 'dd/MM/yyyy')}
                    </p>
                  )}

                  <Button
                    onClick={() => {
                      setSelectedGoal(goal.id);
                      setShowAddAmount(true);
                    }}
                    className="w-full bg-green-600 hover:bg-green-700 text-white"
                    size="sm"
                  >
                    <DollarSign className="h-4 w-4 mr-2" />
                    Adicionar Valor
                  </Button>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Add Amount Modal */}
      <Dialog open={showAddAmount} onOpenChange={setShowAddAmount}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Valor à Meta</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="add_amount">Valor a adicionar</Label>
              <Input
                id="add_amount"
                type="number"
                step="0.01"
                value={addAmountData.amount}
                onChange={(e) => setAddAmountData({ amount: e.target.value })}
                placeholder="0,00"
              />
            </div>

            <Button onClick={handleAddAmount} className="w-full bg-green-600 hover:bg-green-700">
              Adicionar à Meta
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}