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
import { BarChartComponent } from '@/components/charts/BarChartComponent';
import { PieChartComponent } from '@/components/charts/PieChartComponent';
import { PageHeader } from '@/components/shared/PageHeader';

export default function InventoryReportPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['reports-inventory'],
    queryFn: () => reportsApi.getInventory(),
  });

  const items = data?.data?.data || data?.data || [];
  const chartData = items.slice(0, 10).map((item: { name?: string; totalPieces?: number }) => ({
    name: item.name || 'N/A',
    value: item.totalPieces || 0,
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reporte de Inventario"
        actions={[{ label: 'Volver a Reportes', href: '/reports', variant: 'outline' }]}
      />

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Stock por Producto (Top 10)</CardTitle>
          </CardHeader>
          <CardContent>
            <BarChartComponent
              data={chartData}
              bars={[{ dataKey: 'value', name: 'Piezas' }]}
              xAxisKey="name"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Distribución por Categoría</CardTitle>
          </CardHeader>
          <CardContent>
            <PieChartComponent data={chartData} />
          </CardContent>
        </Card>
      </div>

      <div className="rounded-md border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Producto</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>Cajas</TableHead>
              <TableHead>Piezas</TableHead>
              <TableHead>Total Piezas</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">Cargando...</TableCell>
              </TableRow>
            ) : items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  No hay datos de inventario
                </TableCell>
              </TableRow>
            ) : (
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              items.map((item: any) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.product?.name || item.name}</TableCell>
                  <TableCell>{item.product?.sku || item.sku || '—'}</TableCell>
                  <TableCell>{item.stockBoxes ?? 0}</TableCell>
                  <TableCell>{item.stockPieces ?? 0}</TableCell>
                  <TableCell>{item.totalPieces ?? 0}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
