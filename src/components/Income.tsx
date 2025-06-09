import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Plus, TrendingUp, Edit, Trash2, Repeat } from 'lucide-react';
import { useFinanceData, type Income } from '@/hooks/useFinanceData';
import { MonthNavigation } from './MonthNavigation';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

export function Income() {
  const { income, loading, refreshIncome } = useFinanceData();
  const { toast } = useToast();
  const [showAddIncome, setShowAddIncome] = useState(false);
  const [editingIncome, setEditingIncome] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    is_recurring: false,
    recurring_day: ''
  });

  const resetForm = () => {
    setFormData({
      description: '',
      amount: '',
      date: new Date().toISOString().split('T')[0],
      is_recurring: false,
      recurring_day: ''
    });
  };

  const handleSubmit = async () => {
    if (!formData.description || !formData.amount) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive"
      });
      return;
    }

    const data = {
      description: formData.description,
      amount: parseFloat(formData.amount),
      date: formData.date,
      is_recurring: formData.is_recurring,
      recurring_day: formData.is_recurring ? parseInt(formData.recurring_day) : null,
      active: true
    };

    let error;
    if (editingIncome) {
      ({ error } = await supabase
        .from('income')
        .update(data)
        .eq('id', editingIncome));
    } else {
      ({ error } = await supabase
        .from('income')
        .insert(data));
    }

    if (error) {
      toast({
        title: "Erro",
        description: `Erro ao ${editingIncome ? 'atualizar' : 'adicionar'} receita`,
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Sucesso",
      description: `Receita ${editingIncome ? 'atualizada' : 'adicionada'} com sucesso!`
    });

    resetForm();
    setShowAddIncome(false);
    setEditingIncome(null);
    refreshIncome();
  };

  const handleEdit = (incomeItem: Income) => {
    setFormData({
      description: incomeItem.description,
      amount: incomeItem.amount.toString(),
      date: incomeItem.date,
      is_recurring: incomeItem.is_recurring,
      recurring_day: incomeItem.recurring_day?.toString() || ''
    });
    setEditingIncome(incomeItem.id);
    setShowAddIncome(true);
  };

  const handleDelete = async (incomeId: string) => {
    const { error } = await supabase
      .from('income')
      .delete()
      .eq('id', incomeId);

    if (error) {
      toast({
        title: "Erro",
        description: "Erro ao excluir receita",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Sucesso",
      description: "Receita excluída com sucesso!"
    });

    refreshIncome();
  };

  const totalIncome = income.reduce((sum, item) => sum + item.amount, 0);

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
        <h1 className="text-2xl font-bold text-gray-900">Receitas</h1>
        
        <Dialog open={showAddIncome} onOpenChange={(open) => {
          setShowAddIncome(open);
          if (!open) {
            resetForm();
            setEditingIncome(null);
          }
        }}>
          <DialogTrigger asChild>
            <Button className="bg-pink-600 hover:bg-pink-700 text-white">
              <Plus className="h-4 w-4 mr-2" />
              Nova Receita
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingIncome ? 'Editar Receita' : 'Adicionar Nova Receita'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="description">Descrição</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Salário, freelance, etc."
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
                <Label htmlFor="date">Data</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="is_recurring"
                  checked={formData.is_recurring}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_recurring: checked }))}
                />
                <Label htmlFor="is_recurring">Receita recorrente</Label>
              </div>

              {formData.is_recurring && (
                <div>
                  <Label htmlFor="recurring_day">Dia de recebimento (1-31)</Label>
                  <Input
                    id="recurring_day"
                    type="number"
                    min="1"
                    max="31"
                    value={formData.recurring_day}
                    onChange={(e) => setFormData(prev => ({ ...prev, recurring_day: e.target.value }))}
                    placeholder="5"
                  />
                </div>
              )}

              <Button onClick={handleSubmit} className="w-full bg-pink-600 hover:bg-pink-700">
                {editingIncome ? 'Atualizar Receita' : 'Adicionar Receita'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Total Income Card */}
      <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
        <CardHeader>
          <CardTitle className="text-green-800 flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Total de Receitas do Mês
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-green-900">
            R$ {totalIncome.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
        </CardContent>
      </Card>

      {/* Income List */}
      <div className="space-y-4">
        {income.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Nenhuma receita cadastrada ainda.</p>
              <p className="text-sm text-gray-400 mt-1">
                Adicione suas receitas para começar a controlar suas finanças!
              </p>
            </CardContent>
          </Card>
        ) : (
          income.map(item => (
            <Card key={item.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900">{item.description}</h3>
                      {item.is_recurring && (
                        <Badge variant="secondary" className="text-xs bg-pink-100 text-pink-700">
                          <Repeat className="h-3 w-3 mr-1" />
                          Recorrente
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span>Data: {format(new Date(item.date), 'dd/MM/yyyy')}</span>
                      {item.is_recurring && item.recurring_day && (
                        <span>Todo dia {item.recurring_day}</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-lg font-bold text-green-600">
                        R$ {item.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </div>
                    </div>
                    
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(item)}
                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(item.id)}
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