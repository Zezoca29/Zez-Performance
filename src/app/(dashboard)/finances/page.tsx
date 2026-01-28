'use client'

import { Wallet, Trash2 } from 'lucide-react'
import { format } from 'date-fns'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ExpenseForm } from '@/components/finances/expense-form'
import { MonthlySummary } from '@/components/finances/monthly-summary'
import { useExpensesToday, useDeleteExpense } from '@/hooks/use-finances'
import { toast } from 'sonner'

export default function FinancesPage() {
  const { data, isLoading } = useExpensesToday()
  const deleteExpense = useDeleteExpense()

  const handleDelete = async (id: string) => {
    try {
      await deleteExpense.mutateAsync(id)
      toast.success('Gasto removido')
    } catch {
      toast.error('Erro ao remover gasto')
    }
  }

  if (isLoading) {
    return <div className="space-y-6 animate-pulse">
      <div className="h-48 bg-muted rounded-lg" />
      <div className="h-64 bg-muted rounded-lg" />
    </div>
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Financas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center gap-4 py-4">
            <div className="p-4 rounded-full bg-muted">
              <Wallet className="h-10 w-10 text-muted-foreground" />
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold">R$ {(data?.todayTotal ?? 0).toFixed(2)}</p>
              <p className="text-sm text-muted-foreground">gastos hoje</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Transacoes de hoje</CardTitle>
          <ExpenseForm />
        </CardHeader>
        <CardContent>
          {data?.expenses && data.expenses.length > 0 ? (
            <ul className="space-y-2">
              {data.expenses.map((expense) => (
                <li
                  key={expense.id}
                  className="flex items-center justify-between py-2 border-b border-border last:border-0"
                >
                  <div>
                    <p className="text-sm font-medium">{expense.description}</p>
                    <div className="flex items-center gap-2 mt-1">
                      {expense.finance_categories?.name && (
                        <span className="text-xs px-2 py-0.5 rounded bg-muted">
                          {expense.finance_categories.name}
                        </span>
                      )}
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(expense.created_at), 'HH:mm')}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">R$ {Number(expense.amount).toFixed(2)}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(expense.id)}
                      disabled={deleteExpense.isPending}
                    >
                      <Trash2 className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              Nenhum gasto registrado hoje
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Resumo do mes</CardTitle>
        </CardHeader>
        <CardContent>
          <MonthlySummary />
        </CardContent>
      </Card>
    </div>
  )
}
