'use client';

import { useQuery } from '@tanstack/react-query';
import { deliveriesApi } from '@/lib/api/deliveries';
import { Button } from '@/components/ui/button';
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
import { PageHeader } from '@/components/shared/PageHeader';
import { Plus } from 'lucide-react';

const statusLabels: Record<string, string> = {
  PENDING: 'Pendiente',
  IN_PROGRESS: 'En Progreso',
  COMPLETED: 'Completado',
  CANCELLED: 'Cancelado',
};

export default function DeliveriesPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['deliveries'],
    queryFn: () => deliveriesApi.getAll(),
  });

  const deliveries = data?.data?.data || data?.data || [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Entregas"
        description="Gestión de rutas y entregas"
        actions={[
          { label: 'Conductores', href: '/deliveries/drivers', variant: 'outline' },
          { label: 'Nueva Ruta', href: '/deliveries/routes/new', icon: <Plus className="h-4 w-4" /> },
        ]}
      />

      <div className="rounded-md border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Código Ruta</TableHead>
              <TableHead>Conductor</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Pedidos</TableHead>
              <TableHead>Entregados</TableHead>
              <TableHead>Pendientes</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">Cargando...</TableCell>
              </TableRow>
            ) : deliveries.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No hay entregas registradas
                </TableCell>
              </TableRow>
            ) : (
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              deliveries.map((delivery: any) => (
                <TableRow key={delivery.id}>
                  <TableCell className="font-medium">{delivery.routeCode || delivery.code}</TableCell>
                  <TableCell>{delivery.driver?.name || delivery.driverName || '—'}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{statusLabels[delivery.status] || delivery.status}</Badge>
                  </TableCell>
                  <TableCell>{delivery.ordersCount ?? 0}</TableCell>
                  <TableCell>{delivery.deliveredCount ?? 0}</TableCell>
                  <TableCell>{delivery.pendingCount ?? 0}</TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/deliveries/routes/${delivery.id}`}>Ver</Link>
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
