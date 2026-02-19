'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, Package, ShoppingCart, Users } from 'lucide-react';

const kpis = [
  {
    title: 'Ventas del Día',
    value: '$12,450',
    change: '+12.5%',
    icon: DollarSign,
    color: 'text-green-600',
  },
  {
    title: 'Pedidos',
    value: '42',
    change: '+8%',
    icon: ShoppingCart,
    color: 'text-blue-600',
  },
  {
    title: 'Productos',
    value: '1,234',
    change: '+5',
    icon: Package,
    color: 'text-purple-600',
  },
  {
    title: 'Clientes',
    value: '567',
    change: '+12',
    icon: Users,
    color: 'text-orange-600',
  },
];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <Card key={kpi.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {kpi.title}
                </CardTitle>
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

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Ventas del Mes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Gráfico de ventas aquí</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Productos Más Vendidos</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Top 5 productos aquí</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
