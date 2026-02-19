'use client';

import { useQuery } from '@tanstack/react-query';
import { ordersApi } from '@/lib/api/orders';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
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
import { Order } from '@/types';

const statusColors: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  CREATED: 'secondary',
  CONFIRMED: 'default',
  PREPARING: 'default',
  IN_ROUTE: 'default',
  DELIVERED: 'default',
  CANCELLED: 'destructive',
};

const statusLabels: Record<string, string> = {
  CREATED: 'Creado',
  CONFIRMED: 'Confirmado',
  PREPARING: 'Preparando',
  IN_ROUTE: 'En Camino',
  DELIVERED: 'Entregado',
  CANCELLED: 'Cancelado',
};

export default function OrdersPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: () => ordersApi.getAll(),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Pedidos</h1>
        <Button asChild>
          <Link href="/orders/new">
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Pedido
          </Link>
        </Button>
      </div>

      <div className="rounded-md border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Número</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center">
                  Cargando...
                </TableCell>
              </TableRow>
            ) : (
              data?.data?.data?.map((order: Order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{order.orderNumber}</TableCell>
                  <TableCell>{order.customer?.businessName || order.customer?.firstName}</TableCell>
                  <TableCell>${order.total?.toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge variant={statusColors[order.status] || 'default'}>
                      {statusLabels[order.status] || order.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{new Date(order.createdAt).toLocaleDateString('es-MX')}</TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/orders/${order.id}`}>Ver</Link>
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
