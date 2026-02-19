'use client';

import { useQuery } from '@tanstack/react-query';
import { expensesApi } from '@/lib/api/expenses';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChartComponent } from '@/components/charts/LineChartComponent';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatsCard } from '@/components/shared/StatsCard';

export default function ExpenseReportsPage() {
  const { data: totalData } = useQuery({
    queryKey: ['expenses-total'],
    queryFn: () => expensesApi.getTotal(),
  });

  const { data: expensesData } = useQuery({
    queryKey: ['expenses-all-reports'],
    queryFn: () => expensesApi.getAll(),
  });

  const total = totalData?.data?.total || 0;
  const expenses = expensesData?.data?.data || expensesData?.data || [];

  // Group expenses by date for chart
  const chartDataMap = expenses.reduce((acc: Record<string, number>, expense: { expenseDate?: string; amount?: number }) => {
    const date = expense.expenseDate?.split('T')[0] || 'N/A';
    acc[date] = (acc[date] || 0) + (expense.amount || 0);
    return acc;
  }, {} as Record<string, number>);

  const chartData = Object.entries(chartDataMap)
    .map(([date, total]) => ({ date, total }))
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-30);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reporte de Gastos"
        actions={[{ label: 'Volver', href: '/expenses', variant: 'outline' }]}
      />

      <div className="grid gap-4 md:grid-cols-2">
        <StatsCard title="Total del Período" value={`$${(total || 0).toFixed(2)}`} />
        <StatsCard title="Número de Gastos" value={expenses.length} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Gastos por Día (últimos 30 días)</CardTitle>
        </CardHeader>
        <CardContent>
          <LineChartComponent
            data={chartData}
            lines={[{ dataKey: 'total', name: 'Total ($)' }]}
            xAxisKey="date"
          />
        </CardContent>
      </Card>
    </div>
  );
}
