'use client';

import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, Package, ShoppingCart, Users } from 'lucide-react';
import { LineChartComponent } from '@/components/charts/LineChartComponent';
import { BarChartComponent } from '@/components/charts/BarChartComponent';
import { PieChartComponent } from '@/components/charts/PieChartComponent';
import { reportsApi } from '@/lib/api/reports';
import { ordersApi } from '@/lib/api/orders';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Order } from '@/types';

const kpis = [
  { title: 'Ventas del Día', value: '$12,450', change: '+12.5%', icon: DollarSign, color: 'text-green-600' },
  { title: 'Pedidos', value: '42', change: '+8%', icon: ShoppingCart, color: 'text-blue-600' },
  { title: 'Productos', value: '1,234', change: '+5', icon: Package, color: 'text-purple-600' },
  { title: 'Clientes', value: '567', change: '+12', icon: Users, color: 'text-orange-600' },
];

const statusLabels: Record<string, string> = {
  CREATED: 'Creado', CONFIRMED: 'Confirmado', PREPARING: 'Preparando',
  IN_ROUTE: 'En Camino', DELIVERED: 'Entregado', CANCELLED: 'Cancelado',
};

export default function DashboardPage() {
  const { data: salesData } = useQuery({
    queryKey: ['dashboard-sales'],
    queryFn: () => reportsApi.getSalesByPeriod({ days: 7 }),
  });

  const { data: topProductsData } = useQuery({
    queryKey: ['dashboard-top-products'],
    queryFn: () => reportsApi.getTopProducts({ limit: 5 }),
  });

  const { data: categoryData } = useQuery({
    queryKey: ['dashboard-sales-category'],
    queryFn: () => reportsApi.getSalesByCategory(),
  });

  const { data: ordersData } = useQuery({
    queryKey: ['dashboard-recent-orders'],
    queryFn: () => ordersApi.getAll({ limit: 10 }),
  });

  const salesChartData = salesData?.data?.data || salesData?.data || [];
  const topProductsChartData = topProductsData?.data?.data || topProductsData?.data || [];
  const categoryChartData = (categoryData?.data?.data || categoryData?.data || []).map(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (item: any) => ({ name: item.category || item.name, value: item.total || item.value || 0 })
  );
  const recentOrders: Order[] = (ordersData?.data?.data || []) as Order[];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <Card key={kpi.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{kpi.title}</CardTitle>
                <Icon className={`h-5 w-5 ${kpi.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{kpi.value}</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-green-600">{kpi.change}</span> desde ayer
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Ventas Últimos 7 Días</CardTitle>
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
            <PieChartComponent data={categoryChartData} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pedidos Recientes</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Número</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentOrders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground py-4">
                      Sin pedidos recientes
                    </TableCell>
                  </TableRow>
                ) : (
                  recentOrders.map((order: Order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium text-xs">{order.orderNumber}</TableCell>
                      <TableCell className="text-xs">{order.customer?.businessName || order.customer?.firstName || '—'}</TableCell>
                      <TableCell className="text-xs">${order.total?.toFixed(2)}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {statusLabels[order.status] || order.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
