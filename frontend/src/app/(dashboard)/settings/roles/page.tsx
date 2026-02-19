'use client';

import { useQuery } from '@tanstack/react-query';
import { settingsApi } from '@/lib/api/settings';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { PageHeader } from '@/components/shared/PageHeader';
import { Plus } from 'lucide-react';

export default function RolesPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-roles'],
    queryFn: () => settingsApi.getRoles(),
  });

  const roles = data?.data?.data || data?.data || [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Roles"
        description="Gestión de roles del sistema"
        actions={[
          { label: 'Volver', href: '/settings', variant: 'outline' },
          { label: 'Nuevo Rol', href: '/settings/roles/new', icon: <Plus className="h-4 w-4" /> },
        ]}
      />

      <div className="rounded-md border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Descripción</TableHead>
              <TableHead>Usuarios</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8">Cargando...</TableCell>
              </TableRow>
            ) : roles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                  No hay roles configurados
                </TableCell>
              </TableRow>
            ) : (
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              roles.map((role: any) => (
                <TableRow key={role.id}>
                  <TableCell className="font-medium">{role.name}</TableCell>
                  <TableCell>{role.description || '—'}</TableCell>
                  <TableCell>{role.usersCount ?? 0}</TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm">Editar</Button>
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
