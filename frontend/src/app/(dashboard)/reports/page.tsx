'use client';

import { useQuery } from '@tanstack/react-query';
import { reportsApi } from '@/lib/api/reports';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChartComponent } from '@/components/charts/LineChartComponent';
import { BarChartComponent } from '@/components/charts/BarChartComponent';
import { PieChartComponent } from '@/components/charts/PieChartComponent';
import { PageHeader } from '@/components/shared/PageHeader';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function ReportsPage() {
  const { data: salesData } = useQuery({
    queryKey: ['reports-sales-period'],
    queryFn: () => reportsApi.getSalesByPeriod({ days: 30 }),
  });

  const { data: topProductsData } = useQuery({
    queryKey: ['reports-top-products'],
    queryFn: () => reportsApi.getTopProducts({ limit: 5 }),
  });

  const { data: salesByCategoryData } = useQuery({
    queryKey: ['reports-sales-category'],
    queryFn: () => reportsApi.getSalesByCategory(),
  });

  const { data: customersByTierData } = useQuery({
    queryKey: ['reports-customers-tier'],
    queryFn: () => reportsApi.getCustomersByTier(),
  });

  const salesChartData = salesData?.data?.data || salesData?.data || [];
  const topProductsChartData = topProductsData?.data?.data || topProductsData?.data || [];
  const salesByCategoryChartData = (salesByCategoryData?.data?.data || salesByCategoryData?.data || []).map(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (item: any) => ({ name: item.category || item.name, value: item.total || item.value || 0 })
  );
  const customersTierChartData = (customersByTierData?.data?.data || customersByTierData?.data || []).map(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (item: any) => ({ name: item.tier || item.name, value: item.count || item.value || 0 })
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reportes"
        description="Análisis y estadísticas del negocio"
        actions={[
          { label: 'Ventas', href: '/reports/sales', variant: 'outline' },
          { label: 'Inventario', href: '/reports/inventory', variant: 'outline' },
          { label: 'Clientes', href: '/reports/customers', variant: 'outline' },
        ]}
      />

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Ventas Últimos 30 Días</CardTitle>
          </CardHeader>
          <CardContent>
            <LineChartComponent
              data={salesChartData}
              lines={[{ dataKey: 'total', name: 'Ventas ($)' }]}
              xAxisKey="date"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top 5 Productos</CardTitle>
          </CardHeader>
          <CardContent>
            <BarChartComponent
              data={topProductsChartData}
              bars={[{ dataKey: 'total', name: 'Ventas ($)' }]}
              xAxisKey="name"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ventas por Categoría</CardTitle>
          </CardHeader>
          <CardContent>
            <PieChartComponent data={salesByCategoryChartData} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Clientes por Tier</CardTitle>
          </CardHeader>
          <CardContent>
            <PieChartComponent data={customersTierChartData} innerRadius={60} />
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-2">
        <Button variant="outline" asChild>
          <Link href="/reports/sales">Reporte Detallado de Ventas</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/reports/inventory">Reporte de Inventario</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/reports/customers">Reporte de Clientes</Link>
        </Button>
      </div>
    </div>
  );
}
