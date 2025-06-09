import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, ShoppingCart, Trash2, Edit } from 'lucide-react';
import { useFinanceData, type Category } from '@/hooks/useFinanceData';
import { MonthNavigation } from './MonthNavigation';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

export function CategoriesAndTransactions() {
  const { categories, transactions, expenses, loading, refreshCategories, refreshTransactions, refreshExpenses } = useFinanceData();
  const { toast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showAddTransaction, setShowAddTransaction] = useState(false);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [newTransaction, setNewTransaction] = useState({
    category_id: '',
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0]
  });
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    monthly_limit: '',
    color: '#F63D68'
  });

  const resetCategoryForm = () => {
    setCategoryForm({
      name: '',
      monthly_limit: '',
      color: '#F63D68'
    });
  };

  const handleAddCategory = async () => {
    if (!categoryForm.name) {
      toast({
        title: "Erro",
        description: "Nome da categoria é obrigatório",
        variant: "destructive"
      });
      return;
    }

    const data = {
      name: categoryForm.name,
      monthly_limit: parseFloat(categoryForm.monthly_limit) || 0,
      color: categoryForm.color
    };

    let error;
    if (editingCategory) {
      ({ error } = await supabase
        .from('categories')
        .update(data)
        .eq('id', editingCategory));
    } else {
      ({ error } = await supabase
        .from('categories')
        .insert(data));
    }

    if (error) {
      toast({
        title: "Erro",
        description: `Erro ao ${editingCategory ? 'atualizar' : 'adicionar'} categoria`,
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Sucesso",
      description: `Categoria ${editingCategory ? 'atualizada' : 'adicionada'} com sucesso!`
    });

    resetCategoryForm();
    setShowAddCategory(false);
    setEditingCategory(null);
    refreshCategories();
  };

  const handleEditCategory = (category: Category) => {
    setCategoryForm({
      name: category.name,
      monthly_limit: category.monthly_limit.toString(),
      color: category.color
    });
    setEditingCategory(category.id);
    setShowAddCategory(true);
  };

  const handleDeleteCategory = async (categoryId: string) => {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', categoryId);

    if (error) {
      toast({
        title: "Erro",
        description: "Erro ao excluir categoria",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Sucesso",
      description: "Categoria excluída com sucesso!"
    });

    refreshCategories();
  };

  const handleAddTransaction = async () => {
    if (!newTransaction.category_id || !newTransaction.amount || !newTransaction.description) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive"
      });
      return;
    }

    const { error } = await supabase
      .from('transactions')
      .insert({
        category_id: newTransaction.category_id,
        amount: parseFloat(newTransaction.amount),
        description: newTransaction.description,
        date: newTransaction.date
      });

    if (error) {
      toast({
        title: "Erro",
        description: "Erro ao adicionar transação",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Sucesso",
      description: "Transação adicionada com sucesso!"
    });

    setNewTransaction({
      category_id: '',
      amount: '',
      description: '',
      date: new Date().toISOString().split('T')[0]
    });
    setShowAddTransaction(false);
    refreshTransactions();
    refreshCategories();
  };

  const handleDeleteTransaction = async (transactionId: string) => {
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', transactionId);

    if (error) {
      toast({
        title: "Erro",
        description: "Erro ao excluir transação",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Sucesso",
      description: "Transação excluída com sucesso!"
    });

    refreshTransactions();
    refreshCategories();
  };

  const getProgressColor = (percentage: number) => {
    if (percentage < 70) return 'bg-green-500';
    if (percentage < 90) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const categoryTransactions = selectedCategory
    ? transactions.filter(t => t.category_id === selectedCategory)
    : [];

  const categoryExpenses = selectedCategory
    ? expenses.filter(e => e.category_id === selectedCategory)
    : [];

  // Combinar transações e despesas para exibição
  const allCategoryItems = [
    ...categoryTransactions.map(t => ({
      ...t,
      type: 'transaction' as const,
      display_date: t.date,
      display_name: t.description,
      is_paid: true
    })),
    ...categoryExpenses.map(e => ({
      ...e,
      type: 'expense' as const,
      display_date: e.due_date,
      display_name: e.name,
      is_paid: e.was_paid
    }))
  ].sort((a, b) => new Date(b.display_date).getTime() - new Date(a.display_date).getTime());

  if (loading) {
    return (
      <div className="p-6">
        <MonthNavigation />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-3">
                <div className="h-4 bg-gray-200 rounded w-24"></div>
              </CardHeader>
              <CardContent>
                <div className="h-6 bg-gray-200 rounded w-32 mb-2"></div>
                <div className="h-2 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-16"></div>
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
        <h1 className="text-2xl font-bold text-gray-900">Categorias e Gastos</h1>
        
        <div className="flex gap-2">
          <Dialog open={showAddCategory} onOpenChange={(open) => {
            setShowAddCategory(open);
            if (!open) {
              resetCategoryForm();
              setEditingCategory(null);
            }
          }}>
            <DialogTrigger asChild>
              <Button variant="outline" className="border-pink-600 text-pink-600 hover:bg-pink-50">
                <Plus className="h-4 w-4 mr-2" />
                Nova Categoria
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingCategory ? 'Editar Categoria' : 'Adicionar Nova Categoria'}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="categoryName">Nome da Categoria</Label>
                  <Input
                    id="categoryName"
                    value={categoryForm.name}
                    onChange={(e) => setCategoryForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Ex: Mercado, Transporte, etc."
                  />
                </div>

                <div>
                  <Label htmlFor="monthlyLimit">Limite Mensal (R$)</Label>
                  <Input
                    id="monthlyLimit"
                    type="number"
                    step="0.01"
                    value={categoryForm.monthly_limit}
                    onChange={(e) => setCategoryForm(prev => ({ ...prev, monthly_limit: e.target.value }))}
                    placeholder="0,00"
                  />
                </div>

                <div>
                  <Label htmlFor="categoryColor">Cor da Categoria</Label>
                  <div className="flex gap-2 mt-1">
                    {['#F63D68', '#FEA3B4', '#FFE4E8', '#A855F7', '#EC4899', '#F59E0B'].map(color => (
                      <div
                        key={color}
                        className={`w-8 h-8 rounded-full cursor-pointer border-2 ${
                          categoryForm.color === color ? 'border-gray-800' : 'border-gray-300'
                        }`}
                        style={{ backgroundColor: color }}
                        onClick={() => setCategoryForm(prev => ({ ...prev, color }))}
                      />
                    ))}
                  </div>
                </div>

                <Button onClick={handleAddCategory} className="w-full bg-pink-600 hover:bg-pink-700">
                  {editingCategory ? 'Atualizar Categoria' : 'Adicionar Categoria'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={showAddTransaction} onOpenChange={setShowAddTransaction}>
            <DialogTrigger asChild>
              <Button className="bg-pink-600 hover:bg-pink-700 text-white">
                <Plus className="h-4 w-4 mr-2" />
                Novo Gasto
              </Button>
            </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar Novo Gasto</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="category">Categoria</Label>
                <Select 
                  value={newTransaction.category_id} 
                  onValueChange={(value) => setNewTransaction(prev => ({ ...prev, category_id: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(category => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="amount">Valor</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  value={newTransaction.amount}
                  onChange={(e) => setNewTransaction(prev => ({ ...prev, amount: e.target.value }))}
                  placeholder="0,00"
                />
              </div>

              <div>
                <Label htmlFor="description">Descrição</Label>
                <Input
                  id="description"
                  value={newTransaction.description}
                  onChange={(e) => setNewTransaction(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Descrição do gasto"
                />
              </div>

              <div>
                <Label htmlFor="date">Data</Label>
                <Input
                  id="date"
                  type="date"
                  value={newTransaction.date}
                  onChange={(e) => setNewTransaction(prev => ({ ...prev, date: e.target.value }))}
                />
              </div>

              <Button onClick={handleAddTransaction} className="w-full bg-pink-600 hover:bg-pink-700">
                Adicionar Gasto
              </Button>
            </div>
          </DialogContent>
        </Dialog>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map(category => {
          const percentage = category.monthly_limit > 0 ? (category.spent! / category.monthly_limit) * 100 : 0;
          const remaining = Math.max(0, category.monthly_limit - category.spent!);
          
          return (
            <Card 
              key={category.id} 
              className="cursor-pointer hover:shadow-lg transition-shadow duration-200 bg-gradient-to-br from-pink-50 to-purple-50 border-pink-200"
              onClick={() => setSelectedCategory(category.id)}
            >
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-pink-700 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShoppingCart className="h-4 w-4" />
                    {category.name}
                  </div>
                  <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditCategory(category)}
                      className="h-6 w-6 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteCategory(category.id)}
                      className="h-6 w-6 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-600">Gasto:</span>
                  <span className="font-semibold text-pink-800">
                    R$ {category.spent!.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>

                {category.monthly_limit > 0 && (
                  <>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-600">Limite:</span>
                      <span className="text-xs text-gray-700">
                        R$ {category.monthly_limit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-600">Restante:</span>
                        <span className={`text-xs font-medium ${remaining > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          R$ {remaining.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                      
                      <div className="relative">
                        <Progress 
                          value={Math.min(percentage, 100)} 
                          className="h-2"
                        />
                        <div 
                          className={`absolute top-0 left-0 h-2 rounded-full transition-colors ${getProgressColor(percentage)}`}
                          style={{ width: `${Math.min(percentage, 100)}%` }}
                        />
                      </div>
                      
                      <div className="text-center">
                        <span className={`text-xs font-medium ${percentage > 100 ? 'text-red-600' : 'text-gray-600'}`}>
                          {percentage.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Category Transactions Modal */}
      <Dialog open={!!selectedCategory} onOpenChange={() => setSelectedCategory(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {categories.find(c => c.id === selectedCategory)?.name} - Transações
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {allCategoryItems.length === 0 ? (
              <p className="text-center text-gray-500 py-8">
                Nenhuma transação ou despesa encontrada nesta categoria.
              </p>
            ) : (
              allCategoryItems.map(item => (
                <div key={`${item.type}_${item.id}`} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-gray-900">{item.display_name}</p>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            item.type === 'transaction' 
                              ? 'bg-blue-100 text-blue-700' 
                              : 'bg-purple-100 text-purple-700'
                          }`}>
                            {item.type === 'transaction' ? 'Transação' : 'Despesa'}
                          </span>
                          {item.type === 'expense' && (
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              item.is_paid 
                                ? 'bg-green-100 text-green-700' 
                                : 'bg-red-100 text-red-700'
                            }`}>
                              {item.is_paid ? 'Pago' : 'Pendente'}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500">
                          {format(new Date(item.display_date), 'dd/MM/yyyy')}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-pink-600">
                          R$ {item.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      if (item.type === 'transaction') {
                        handleDeleteTransaction(item.id);
                      }
                      // Note: Expenses deletion would need a separate handler
                    }}
                    className="ml-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                    disabled={item.type === 'expense'} // Por enquanto, não permitir deletar despesas aqui
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}