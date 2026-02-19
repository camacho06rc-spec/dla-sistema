'use client';

import { useQuery } from '@tanstack/react-query';
import { deliveriesApi } from '@/lib/api/deliveries';
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

export default function DriversPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['delivery-drivers'],
    queryFn: () => deliveriesApi.getDrivers(),
  });

  const drivers = data?.data?.data || data?.data || [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Conductores"
        description="Gestión de conductores de entrega"
        actions={[
          { label: 'Volver', href: '/deliveries', variant: 'outline' },
          { label: 'Nuevo Conductor', href: '/deliveries/drivers/new', icon: <Plus className="h-4 w-4" /> },
        ]}
      />

      <div className="rounded-md border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Teléfono</TableHead>
              <TableHead>Licencia</TableHead>
              <TableHead>Estado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8">Cargando...</TableCell>
              </TableRow>
            ) : drivers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                  No hay conductores registrados
                </TableCell>
              </TableRow>
            ) : (
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              drivers.map((driver: any) => (
                <TableRow key={driver.id}>
                  <TableCell className="font-medium">{driver.name}</TableCell>
                  <TableCell>{driver.phone || '—'}</TableCell>
                  <TableCell>{driver.licenseNumber || '—'}</TableCell>
                  <TableCell>
                    <Badge variant={driver.isActive ? 'default' : 'secondary'}>
                      {driver.isActive ? 'Activo' : 'Inactivo'}
                    </Badge>
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
