'use client';

import { useQuery } from '@tanstack/react-query';
import { cashRegisterApi } from '@/lib/api/cashRegister';
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

export default function CashRegisterHistoryPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['cash-register-all'],
    queryFn: () => cashRegisterApi.getAll(),
  });

  const sessions = data?.data?.data || data?.data || [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Historial de Sesiones de Caja"
        actions={[{ label: 'Volver', href: '/cash-register', variant: 'outline' }]}
      />

      <div className="rounded-md border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Código</TableHead>
              <TableHead>Usuario</TableHead>
              <TableHead>Sucursal</TableHead>
              <TableHead>Apertura</TableHead>
              <TableHead>Cierre</TableHead>
              <TableHead>Efectivo Inicial</TableHead>
              <TableHead>Efectivo Final</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8">Cargando...</TableCell>
              </TableRow>
            ) : sessions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                  No hay sesiones registradas
                </TableCell>
              </TableRow>
            ) : (
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              sessions.map((session: any) => (
                <TableRow key={session.id}>
                  <TableCell className="font-medium">{session.sessionCode || session.id?.substring(0, 8)}</TableCell>
                  <TableCell>{session.user?.firstName || '—'}</TableCell>
                  <TableCell>{session.branch?.name || '—'}</TableCell>
                  <TableCell>{session.openedAt ? new Date(session.openedAt).toLocaleDateString('es-MX') : '—'}</TableCell>
                  <TableCell>{session.closedAt ? new Date(session.closedAt).toLocaleDateString('es-MX') : '—'}</TableCell>
                  <TableCell>${(session.initialCash || 0).toFixed(2)}</TableCell>
                  <TableCell>{session.finalCash != null ? `$${session.finalCash.toFixed(2)}` : '—'}</TableCell>
                  <TableCell>
                    <Badge variant={session.status === 'OPEN' ? 'default' : 'secondary'}>
                      {session.status === 'OPEN' ? 'Abierta' : 'Cerrada'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/cash-register/${session.id}`}>Ver</Link>
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
