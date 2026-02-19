'use client';

import { useQuery } from '@tanstack/react-query';
import { deliveriesApi } from '@/lib/api/deliveries';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { PageHeader } from '@/components/shared/PageHeader';
import { use } from 'react';

interface Props {
  params: Promise<{ id: string }>;
}

export default function RouteDetailsPage({ params }: Props) {
  const { id } = use(params);

  const { data, isLoading } = useQuery({
    queryKey: ['delivery-route', id],
    queryFn: () => deliveriesApi.getRoute(id),
  });

  const route = data?.data;

  return (
    <div className="space-y-6">
      <PageHeader
        title={isLoading ? 'Cargando...' : `Ruta: ${route?.name || id}`}
        actions={[{ label: 'Volver a Rutas', href: '/deliveries/routes', variant: 'outline' }]}
      />

      {route && (
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Sucursal</CardTitle>
            </CardHeader>
            <CardContent>{route.branch?.name || route.branchId}</CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Conductor</CardTitle>
            </CardHeader>
            <CardContent>{route.driver?.name || '—'}</CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Vehículo</CardTitle>
            </CardHeader>
            <CardContent>{route.vehicle || '—'}</CardContent>
          </Card>
        </div>
      )}

      <div className="rounded-md border bg-white">
        <div className="p-4 font-semibold border-b">Pedidos en esta Ruta</div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Número de Pedido</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Estado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8">Cargando...</TableCell>
              </TableRow>
            ) : !route?.orders?.length ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                  No hay pedidos asignados
                </TableCell>
              </TableRow>
            ) : (
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              route.orders.map((order: any) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{order.orderNumber}</TableCell>
                  <TableCell>{order.customer?.businessName || order.customer?.firstName}</TableCell>
                  <TableCell>${order.total?.toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{order.status}</Badge>
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
