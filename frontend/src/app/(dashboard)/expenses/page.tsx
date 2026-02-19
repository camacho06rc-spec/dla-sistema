'use client';

import { useQuery } from '@tanstack/react-query';
import { expensesApi } from '@/lib/api/expenses';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatsCard } from '@/components/shared/StatsCard';
import { Plus, Receipt } from 'lucide-react';

export default function ExpensesPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['expenses'],
    queryFn: () => expensesApi.getAll(),
  });

  const expenses = data?.data?.data || data?.data || [];

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekStart = new Date(todayStart);
  weekStart.setDate(weekStart.getDate() - 7);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const totalToday = expenses
    .filter((e: { expenseDate?: string }) => e.expenseDate && new Date(e.expenseDate) >= todayStart)
    .reduce((sum: number, e: { amount?: number }) => sum + (e.amount || 0), 0);

  const totalWeek = expenses
    .filter((e: { expenseDate?: string }) => e.expenseDate && new Date(e.expenseDate) >= weekStart)
    .reduce((sum: number, e: { amount?: number }) => sum + (e.amount || 0), 0);

  const totalMonth = expenses
    .filter((e: { expenseDate?: string }) => e.expenseDate && new Date(e.expenseDate) >= monthStart)
    .reduce((sum: number, e: { amount?: number }) => sum + (e.amount || 0), 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Gastos"
        description="Control de gastos operativos"
        actions={[
          { label: 'Por Categoría', href: '/expenses/by-category', variant: 'outline' },
          { label: 'Reportes', href: '/expenses/reports', variant: 'outline' },
          { label: 'Nuevo Gasto', href: '/expenses/new', icon: <Plus className="h-4 w-4" /> },
        ]}
      />

      <div className="grid gap-4 md:grid-cols-3">
        <StatsCard title="Total Este Mes" value={`$${totalMonth.toFixed(2)}`} icon={<Receipt className="h-4 w-4" />} />
        <StatsCard title="Total Esta Semana" value={`$${totalWeek.toFixed(2)}`} />
        <StatsCard title="Total Hoy" value={`$${totalToday.toFixed(2)}`} />
      </div>

      <div className="rounded-md border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fecha</TableHead>
              <TableHead>Categoría</TableHead>
              <TableHead>Monto</TableHead>
              <TableHead>Descripción</TableHead>
              <TableHead>Creado Por</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">Cargando...</TableCell>
              </TableRow>
            ) : expenses.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No hay gastos registrados
                </TableCell>
              </TableRow>
            ) : (
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              expenses.map((expense: any) => (
                <TableRow key={expense.id}>
                  <TableCell>
                    {expense.expenseDate ? new Date(expense.expenseDate).toLocaleDateString('es-MX') : '—'}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{expense.category || '—'}</Badge>
                  </TableCell>
                  <TableCell className="font-medium">${(expense.amount || 0).toFixed(2)}</TableCell>
                  <TableCell>{expense.description || '—'}</TableCell>
                  <TableCell>{expense.createdBy?.firstName || '—'}</TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/expenses/${expense.id}/edit`}>Editar</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
