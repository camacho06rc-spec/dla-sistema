'use client';

import { useQuery } from '@tanstack/react-query';
import { expensesApi } from '@/lib/api/expenses';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChartComponent } from '@/components/charts/PieChartComponent';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { PageHeader } from '@/components/shared/PageHeader';

export default function ExpensesByCategoryPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['expenses-by-category'],
    queryFn: () => expensesApi.getByCategory(),
  });

  const categories = data?.data?.data || data?.data || [];
  const chartData = categories.map((cat: { category?: string; name?: string; total?: number; count?: number }) => ({
    name: cat.category || cat.name || 'N/A',
    value: cat.total || 0,
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Gastos por Categoría"
        actions={[{ label: 'Volver', href: '/expenses', variant: 'outline' }]}
      />

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Distribución por Categoría</CardTitle>
          </CardHeader>
          <CardContent>
            <PieChartComponent data={chartData} />
          </CardContent>
        </Card>

        <div className="rounded-md border bg-white">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Categoría</TableHead>
                <TableHead>Cantidad</TableHead>
                <TableHead>Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-8">Cargando...</TableCell>
                </TableRow>
              ) : categories.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                    No hay datos disponibles
                  </TableCell>
                </TableRow>
              ) : (
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                categories.map((cat: any, index: number) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{cat.category || cat.name}</TableCell>
                    <TableCell>{cat.count || 0}</TableCell>
                    <TableCell>${(cat.total || 0).toFixed(2)}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
