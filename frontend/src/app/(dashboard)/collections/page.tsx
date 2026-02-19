'use client';

import { useQuery } from '@tanstack/react-query';
import { collectionsApi } from '@/lib/api/collections';
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
import { StatsCard } from '@/components/shared/StatsCard';
import { DollarSign, AlertCircle, CheckCircle } from 'lucide-react';

export default function CollectionsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['collections-pending'],
    queryFn: () => collectionsApi.getPending(),
  });

  const pending = data?.data?.data || data?.data || [];
  const totalPending = pending.reduce((sum: number, item: { amount?: number }) => sum + (item.amount || 0), 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Cobranza"
        description="Gestión de cuentas por cobrar y pagos"
        actions={[
          { label: 'Historial de Pagos', href: '/collections/payments', variant: 'outline' },
          { label: 'Registrar Pago', href: '/collections/record-payment' },
        ]}
      />

      <div className="grid gap-4 md:grid-cols-3">
        <StatsCard
          title="Total Pendiente"
          value={`$${totalPending.toFixed(2)}`}
          icon={<DollarSign className="h-4 w-4" />}
        />
        <StatsCard
          title="Cuentas Pendientes"
          value={pending.length}
          icon={<AlertCircle className="h-4 w-4" />}
        />
        <StatsCard
          title="Vencidas"
          value={pending.filter((i: { daysOverdue?: number }) => (i.daysOverdue || 0) > 0).length}
          icon={<CheckCircle className="h-4 w-4" />}
        />
      </div>

      <div className="rounded-md border bg-white">
        <div className="p-4 font-semibold border-b flex items-center justify-between">
          <span>Cuentas Pendientes</span>
          <Button variant="outline" size="sm" asChild>
            <Link href="/collections/pending">Ver Todas</Link>
          </Button>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cliente</TableHead>
              <TableHead>Factura</TableHead>
              <TableHead>Monto</TableHead>
              <TableHead>Vencimiento</TableHead>
              <TableHead>Días Vencido</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">Cargando...</TableCell>
              </TableRow>
            ) : pending.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No hay cuentas pendientes
                </TableCell>
              </TableRow>
            ) : (
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              pending.slice(0, 10).map((item: any) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">
                    {item.customer?.businessName || item.customer?.firstName || item.customerId}
                  </TableCell>
                  <TableCell>{item.invoiceNumber || item.reference || '—'}</TableCell>
                  <TableCell>${(item.amount || 0).toFixed(2)}</TableCell>
                  <TableCell>
                    {item.dueDate ? new Date(item.dueDate).toLocaleDateString('es-MX') : '—'}
                  </TableCell>
                  <TableCell>
                    {item.daysOverdue ? (
                      <Badge variant="destructive">{item.daysOverdue} días</Badge>
                    ) : (
                      <Badge variant="default">Al día</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm" asChild>
                      <Link href="/collections/record-payment">Registrar Pago</Link>
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
