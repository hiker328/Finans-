import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, CreditCard, Edit, Trash2, Check, Clock, AlertTriangle } from 'lucide-react';
import { useFinanceData, type Expense } from '@/hooks/useFinanceData';
import { MonthNavigation } from './MonthNavigation';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { format, isBefore } from 'date-fns';

export function Expenses() {
  const { expenses, categories, loading, refreshExpenses } = useFinanceData();
  const { toast } = useToast();
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [editingExpense, setEditingExpense] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    due_date: new Date().toISOString().split('T')[0],
    is_recurring: false,
    recurrence_count: '1',
    category_id: 'none'
  });

  const resetForm = () => {
    setFormData({
      name: '',
      amount: '',
      due_date: new Date().toISOString().split('T')[0],
      is_recurring: false,
      recurrence_count: '1',
      category_id: 'none'
    });
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.amount) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive"
      });
      return;
    }

    const data = {
      name: formData.name,
      amount: parseFloat(formData.amount),
      due_date: formData.due_date,
      is_recurring: formData.is_recurring,
      recurrence_count: formData.is_recurring ? parseInt(formData.recurrence_count) : 1,
      current_recurrence: 1,
      was_paid: false,
      category_id: formData.category_id === 'none' ? null : formData.category_id
    };

    let error;
    if (editingExpense) {
      ({ error } = await supabase
        .from('expenses')
        .update(data)
        .eq('id', editingExpense));
    } else {
      ({ error } = await supabase
        .from('expenses')
        .insert(data));
    }

    if (error) {
      toast({
        title: "Erro",
        description: `Erro ao ${editingExpense ? 'atualizar' : 'adicionar'} despesa`,
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Sucesso",
      description: `Despesa ${editingExpense ? 'atualizada' : 'adicionada'} com sucesso!`
    });

    resetForm();
    setShowAddExpense(false);
    setEditingExpense(null);
    refreshExpenses();
  };

  const handleEdit = (expense: Expense) => {
    setFormData({
      name: expense.name,
      amount: expense.amount.toString(),
      due_date: expense.due_date,
      is_recurring: expense.is_recurring,
      recurrence_count: expense.recurrence_count.toString(),
      category_id: expense.category_id || 'none'
    });
    setEditingExpense(expense.id);
    setShowAddExpense(true);
  };

  const handleDelete = async (expenseId: string) => {
    const { error } = await supabase
      .from('expenses')
      .delete()
      .eq('id', expenseId);

    if (error) {
      toast({
        title: "Erro",
        description: "Erro ao excluir despesa",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Sucesso",
      description: "Despesa excluída com sucesso!"
    });

    refreshExpenses();
  };

  const handleTogglePaid = async (expenseId: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from('expenses')
      .update({
        was_paid: !currentStatus,
        paid_at: !currentStatus ? new Date().toISOString() : null
      })
      .eq('id', expenseId);

    if (error) {
      toast({
        title: "Erro",
        description: "Erro ao atualizar status da despesa",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Sucesso",
      description: `Despesa marcada como ${!currentStatus ? 'paga' : 'não paga'}!`
    });

    refreshExpenses();
  };

  const paidExpenses = expenses.filter(e => e.was_paid);
  const unpaidExpenses = expenses.filter(e => !e.was_paid);
  const totalPaid = paidExpenses.reduce((sum, e) => sum + e.amount, 0);
  const totalUnpaid = unpaidExpenses.reduce((sum, e) => sum + e.amount, 0);

  const getStatusIcon = (expense: Expense) => {
    if (expense.was_paid) {
      return <Check className="h-4 w-4 text-green-600" />;
    }
    if (isBefore(new Date(expense.due_date), new Date())) {
      return <AlertTriangle className="h-4 w-4 text-red-600" />;
    }
    return <Clock className="h-4 w-4 text-yellow-600" />;
  };

  const getStatusColor = (expense: Expense) => {
    if (expense.was_paid) return 'border-green-200 bg-green-50';
    if (isBefore(new Date(expense.due_date), new Date())) return 'border-red-200 bg-red-50';
    return 'border-yellow-200 bg-yellow-50';
  };

  if (loading) {
    return (
      <div className="p-6">
        <MonthNavigation />
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...Array(2)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-6 bg-gray-200 rounded w-32"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-8 bg-gray-200 rounded w-48"></div>
                </CardContent>
              </Card>
            ))}
          </div>
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
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
        <h1 className="text-2xl font-bold text-gray-900">Despesas Fixas</h1>
        
        <Dialog open={showAddExpense} onOpenChange={(open) => {
          setShowAddExpense(open);
          if (!open) {
            resetForm();
            setEditingExpense(null);
          }
        }}>
          <DialogTrigger asChild>
            <Button className="bg-pink-600 hover:bg-pink-700 text-white">
              <Plus className="h-4 w-4 mr-2" />
              Nova Despesa
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingExpense ? 'Editar Despesa' : 'Adicionar Nova Despesa'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Nome</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Aluguel, conta de luz, etc."
                />
              </div>

              <div>
                <Label htmlFor="amount">Valor</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                  placeholder="0,00"
                />
              </div>

              <div>
                <Label htmlFor="category">Categoria (Opcional)</Label>
                <Select 
                  value={formData.category_id} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, category_id: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Sem categoria</SelectItem>
                    {categories.map(category => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="due_date">Data de Vencimento</Label>
                <Input
                  id="due_date"
                  type="date"
                  value={formData.due_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, due_date: e.target.value }))}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="is_recurring"
                  checked={formData.is_recurring}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_recurring: checked }))}
                />
                <Label htmlFor="is_recurring">Despesa recorrente/parcelada</Label>
              </div>

              {formData.is_recurring && (
                <div>
                  <Label htmlFor="recurrence_count">Número de parcelas (0 = infinito)</Label>
                  <Input
                    id="recurrence_count"
                    type="number"
                    min="0"
                    value={formData.recurrence_count}
                    onChange={(e) => setFormData(prev => ({ ...prev, recurrence_count: e.target.value }))}
                    placeholder="12"
                  />
                </div>
              )}

              <Button onClick={handleSubmit} className="w-full bg-pink-600 hover:bg-pink-700">
                {editingExpense ? 'Atualizar Despesa' : 'Adicionar Despesa'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardHeader>
            <CardTitle className="text-green-800 flex items-center gap-2">
              <Check className="h-5 w-5" />
              Despesas Pagas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-900">
              R$ {totalPaid.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-sm text-green-700 mt-1">
              {paidExpenses.length} despesa{paidExpenses.length !== 1 ? 's' : ''} paga{paidExpenses.length !== 1 ? 's' : ''}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardHeader>
            <CardTitle className="text-orange-800 flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Despesas Pendentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-900">
              R$ {totalUnpaid.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-sm text-orange-700 mt-1">
              {unpaidExpenses.length} despesa{unpaidExpenses.length !== 1 ? 's' : ''} pendente{unpaidExpenses.length !== 1 ? 's' : ''}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Expenses List */}
      <div className="space-y-4">
        {expenses.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Nenhuma despesa cadastrada ainda.</p>
              <p className="text-sm text-gray-400 mt-1">
                Adicione suas despesas fixas para manter o controle!
              </p>
            </CardContent>
          </Card>
        ) : (
          expenses.map(expense => (
            <Card key={expense.id} className={`hover:shadow-md transition-shadow ${getStatusColor(expense)}`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Checkbox
                      checked={expense.was_paid}
                      onCheckedChange={() => handleTogglePaid(expense.id, expense.was_paid)}
                      className="data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
                    />
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className={`font-semibold ${expense.was_paid ? 'line-through text-gray-600' : 'text-gray-900'}`}>
                          {expense.name}
                        </h3>
                        {expense.is_recurring && (
                          <Badge variant="secondary" className="text-xs bg-purple-100 text-purple-700">
                            {expense.recurrence_count > 1 ? `${expense.current_recurrence}/${expense.recurrence_count}` : 'Recorrente'}
                          </Badge>
                        )}
                        {getStatusIcon(expense)}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span>Vencimento: {format(new Date(expense.due_date), 'dd/MM/yyyy')}</span>
                        {expense.paid_at && (
                          <span className="text-green-600">
                            Pago em: {format(new Date(expense.paid_at), 'dd/MM/yyyy')}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className={`text-lg font-bold ${expense.was_paid ? 'text-green-600' : 'text-orange-600'}`}>
                        R$ {expense.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </div>
                    </div>
                    
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(expense)}
                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(expense.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}