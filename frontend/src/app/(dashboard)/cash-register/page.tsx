'use client';

import { useQuery } from '@tanstack/react-query';
import { cashRegisterApi } from '@/lib/api/cashRegister';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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

export default function CashRegisterPage() {
  const { data: activeData } = useQuery({
    queryKey: ['cash-register-active'],
    queryFn: () => cashRegisterApi.getActive(),
  });

  const { data: historyData, isLoading } = useQuery({
    queryKey: ['cash-register-history'],
    queryFn: () => cashRegisterApi.getAll(),
  });

  const activeSession = activeData?.data;
  const sessions = historyData?.data?.data || historyData?.data || [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Caja Registradora"
        description="Gestión de sesiones de caja"
        actions={!activeSession ? [
          { label: 'Abrir Sesión', href: '/cash-register/open', icon: <Plus className="h-4 w-4" /> },
        ] : []}
      />

      {activeSession ? (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="text-green-800 flex items-center justify-between">
              Sesión Activa
              <Badge variant="default" className="bg-green-600">Abierta</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm"><span className="font-medium">Código:</span> {activeSession.sessionCode || activeSession.id}</p>
            <p className="text-sm"><span className="font-medium">Apertura:</span> {activeSession.openedAt ? new Date(activeSession.openedAt).toLocaleString('es-MX') : '—'}</p>
            <p className="text-sm"><span className="font-medium">Efectivo Inicial:</span> ${(activeSession.initialCash || 0).toFixed(2)}</p>
            <p className="text-sm"><span className="font-medium">Sucursal:</span> {activeSession.branch?.name || activeSession.branchId}</p>
            <div className="flex gap-2 mt-4">
              <Button asChild variant="outline">
                <Link href={`/cash-register/${activeSession.id}`}>Ver Detalles</Link>
              </Button>
              <Button asChild variant="destructive">
                <Link href={`/cash-register/${activeSession.id}/close`}>Cerrar Sesión</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-dashed">
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground mb-4">No hay sesión activa</p>
            <Button asChild>
              <Link href="/cash-register/open">
                <Plus className="mr-2 h-4 w-4" />
                Abrir Nueva Sesión
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="rounded-md border bg-white">
        <div className="p-4 font-semibold border-b flex items-center justify-between">
          <span>Historial de Sesiones</span>
          <Button variant="outline" size="sm" asChild>
            <Link href="/cash-register/history">Ver Todo</Link>
          </Button>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Código</TableHead>
              <TableHead>Usuario</TableHead>
              <TableHead>Sucursal</TableHead>
              <TableHead>Apertura</TableHead>
              <TableHead>Cierre</TableHead>
              <TableHead>Efectivo Inicial</TableHead>
              <TableHead>Estado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">Cargando...</TableCell>
              </TableRow>
            ) : sessions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No hay sesiones registradas
                </TableCell>
              </TableRow>
            ) : (
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              sessions.slice(0, 5).map((session: any) => (
                <TableRow key={session.id}>
                  <TableCell className="font-medium">{session.sessionCode || session.id?.substring(0, 8)}</TableCell>
                  <TableCell>{session.user?.firstName || '—'}</TableCell>
                  <TableCell>{session.branch?.name || '—'}</TableCell>
                  <TableCell>{session.openedAt ? new Date(session.openedAt).toLocaleDateString('es-MX') : '—'}</TableCell>
                  <TableCell>{session.closedAt ? new Date(session.closedAt).toLocaleDateString('es-MX') : '—'}</TableCell>
                  <TableCell>${(session.initialCash || 0).toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge variant={session.status === 'OPEN' ? 'default' : 'secondary'}>
                      {session.status === 'OPEN' ? 'Abierta' : 'Cerrada'}
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
