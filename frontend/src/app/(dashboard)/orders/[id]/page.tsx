'use client';

import { useQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { ordersApi } from '@/lib/api/orders';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

const statusLabels: Record<string, string> = {
  CREATED: 'Creado',
  CONFIRMED: 'Confirmado',
  PREPARING: 'Preparando',
  IN_ROUTE: 'En Camino',
  DELIVERED: 'Entregado',
  CANCELLED: 'Cancelado',
};

export default function OrderDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const { data, isLoading } = useQuery({
    queryKey: ['orders', id],
    queryFn: () => ordersApi.getById(id),
  });

  const order = data?.data;

  if (isLoading) return <div className="p-6">Cargando...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" asChild>
          <Link href="/orders">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">Pedido {order?.orderNumber}</h1>
        {order?.status && (
          <Badge>{statusLabels[order.status] || order.status}</Badge>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Detalles del Pedido</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p><span className="font-medium">Cliente:</span> {order?.customer?.businessName || order?.customer?.firstName}</p>
          <p><span className="font-medium">Total:</span> ${order?.total?.toFixed(2)}</p>
          <p><span className="font-medium">Método de Pago:</span> {order?.paymentMethod}</p>
          <p><span className="font-medium">Notas:</span> {order?.notes || '-'}</p>
          <p><span className="font-medium">Fecha:</span> {order?.createdAt ? new Date(order.createdAt).toLocaleString('es-MX') : '-'}</p>
        </CardContent>
      </Card>
    </div>
  );
}
