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
import { StatsCard } from '@/components/shared/StatsCard';

export default function CustomersReportPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['reports-customers'],
    queryFn: () => reportsApi.getCustomers(),
  });

  const { data: tierData } = useQuery({
    queryKey: ['reports-customers-tier'],
    queryFn: () => reportsApi.getCustomersByTier(),
  });

  const customers = data?.data?.data || data?.data || [];
  const tierChartData = (tierData?.data?.data || tierData?.data || []).map(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (item: any) => ({ name: item.tier || item.name, value: item.count || item.value || 0 })
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reporte de Clientes"
        actions={[{ label: 'Volver a Reportes', href: '/reports', variant: 'outline' }]}
      />

      <div className="grid gap-4 md:grid-cols-3">
        <StatsCard title="Total Clientes" value={customers.length} />
        <StatsCard
          title="VIP"
          value={customers.filter((c: { tier?: string }) => c.tier === 'VIP').length}
        />
        <StatsCard
          title="Frecuentes"
          value={customers.filter((c: { tier?: string }) => c.tier === 'FRECUENTE').length}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Distribución por Tier</CardTitle>
          </CardHeader>
          <CardContent>
            <PieChartComponent data={tierChartData} innerRadius={60} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Clientes por Compras</CardTitle>
          </CardHeader>
          <CardContent>
            <BarChartComponent
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              data={customers.slice(0, 5).map((c: any) => ({ name: c.businessName || c.firstName, value: c.totalPurchases || 0 }))}
              bars={[{ dataKey: 'value', name: 'Compras ($)' }]}
              xAxisKey="name"
            />
          </CardContent>
        </Card>
      </div>

      <div className="rounded-md border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cliente</TableHead>
              <TableHead>Tier</TableHead>
              <TableHead>Total Compras</TableHead>
              <TableHead>Último Pedido</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8">Cargando...</TableCell>
              </TableRow>
            ) : customers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                  No hay datos de clientes
                </TableCell>
              </TableRow>
            ) : (
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              customers.map((customer: any) => (
                <TableRow key={customer.id}>
                  <TableCell className="font-medium">
                    {customer.businessName || `${customer.firstName} ${customer.lastName}`}
                  </TableCell>
                  <TableCell>{customer.tier}</TableCell>
                  <TableCell>${(customer.totalPurchases || 0).toFixed(2)}</TableCell>
                  <TableCell>
                    {customer.lastOrderDate
                      ? new Date(customer.lastOrderDate).toLocaleDateString('es-MX')
                      : '—'}
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
