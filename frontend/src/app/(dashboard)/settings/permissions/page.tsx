'use client';

import { useQuery } from '@tanstack/react-query';
import { settingsApi } from '@/lib/api/settings';
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

export default function PermissionsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-permissions'],
    queryFn: () => settingsApi.getPermissions(),
  });

  const permissions = data?.data?.data || data?.data || [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Permisos"
        description="Lista de todos los permisos disponibles en el sistema"
        actions={[{ label: 'Volver', href: '/settings', variant: 'outline' }]}
      />

      <div className="rounded-md border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Permiso</TableHead>
              <TableHead>Módulo</TableHead>
              <TableHead>Descripción</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-8">Cargando...</TableCell>
              </TableRow>
            ) : permissions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                  No hay permisos disponibles
                </TableCell>
              </TableRow>
            ) : (
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              permissions.map((permission: any) => (
                <TableRow key={permission.id}>
                  <TableCell className="font-medium font-mono text-sm">{permission.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{permission.module || '—'}</Badge>
                  </TableCell>
                  <TableCell>{permission.description || '—'}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
