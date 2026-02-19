'use client';

import { useQuery } from '@tanstack/react-query';
import { reportsApi } from '@/lib/api/reports';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChartComponent } from '@/components/charts/LineChartComponent';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatsCard } from '@/components/shared/StatsCard';

export default function SalesReportPage() {
  const { data: salesData, isLoading } = useQuery({
    queryKey: ['reports-sales'],
    queryFn: () => reportsApi.getSales(),
  });

  const { data: periodData } = useQuery({
    queryKey: ['reports-sales-period-30'],
    queryFn: () => reportsApi.getSalesByPeriod({ days: 30 }),
  });

  const sales = salesData?.data?.data || salesData?.data || [];
  const chartData = periodData?.data?.data || periodData?.data || [];
  const grossTotal = sales.reduce((sum: number, s: { total?: number }) => sum + (s.total || 0), 0);
  const discountTotal = sales.reduce((sum: number, s: { discount?: number }) => sum + (s.discount || 0), 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reporte de Ventas"
        actions={[{ label: 'Volver a Reportes', href: '/reports', variant: 'outline' }]}
      />

      <div className="grid gap-4 md:grid-cols-3">
        <StatsCard title="Ventas Brutas" value={`$${grossTotal.toFixed(2)}`} />
        <StatsCard title="Descuentos" value={`$${discountTotal.toFixed(2)}`} />
        <StatsCard title="Ventas Netas" value={`$${(grossTotal - discountTotal).toFixed(2)}`} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tendencia de Ventas (30 días)</CardTitle>
        </CardHeader>
        <CardContent>
          <LineChartComponent
            data={chartData}
            lines={[{ dataKey: 'total', name: 'Ventas ($)' }]}
            xAxisKey="date"
          />
        </CardContent>
      </Card>

      <div className="rounded-md border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fecha</TableHead>
              <TableHead>Pedido</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Descuento</TableHead>
              <TableHead>Neto</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">Cargando...</TableCell>
              </TableRow>
            ) : sales.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No hay datos de ventas
                </TableCell>
              </TableRow>
            ) : (
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              sales.map((sale: any) => (
                <TableRow key={sale.id}>
                  <TableCell>{sale.date ? new Date(sale.date).toLocaleDateString('es-MX') : '—'}</TableCell>
                  <TableCell className="font-medium">{sale.orderNumber || '—'}</TableCell>
                  <TableCell>{sale.customer?.businessName || sale.customer?.firstName || '—'}</TableCell>
                  <TableCell>${(sale.total || 0).toFixed(2)}</TableCell>
                  <TableCell>${(sale.discount || 0).toFixed(2)}</TableCell>
                  <TableCell>${((sale.total || 0) - (sale.discount || 0)).toFixed(2)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
