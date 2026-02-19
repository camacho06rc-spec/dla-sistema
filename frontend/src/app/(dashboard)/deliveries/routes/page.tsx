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

export default function RoutesPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['delivery-routes'],
    queryFn: () => deliveriesApi.getRoutes(),
  });

  const routes = data?.data?.data || data?.data || [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Rutas de Entrega"
        actions={[
          { label: 'Volver', href: '/deliveries', variant: 'outline' },
          { label: 'Nueva Ruta', href: '/deliveries/routes/new', icon: <Plus className="h-4 w-4" /> },
        ]}
      />

      <div className="rounded-md border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Sucursal</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>Conductor</TableHead>
              <TableHead>Vehículo</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">Cargando...</TableCell>
              </TableRow>
            ) : routes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No hay rutas registradas
                </TableCell>
              </TableRow>
            ) : (
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              routes.map((route: any) => (
                <TableRow key={route.id}>
                  <TableCell className="font-medium">{route.name}</TableCell>
                  <TableCell>{route.branch?.name || route.branchId}</TableCell>
                  <TableCell>{route.routeDate ? new Date(route.routeDate).toLocaleDateString('es-MX') : '—'}</TableCell>
                  <TableCell>{route.driver?.name || '—'}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{route.vehicle || '—'}</Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/deliveries/routes/${route.id}`}>Ver</Link>
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
