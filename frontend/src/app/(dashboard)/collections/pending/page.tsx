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

export default function PendingAccountsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['collections-accounts'],
    queryFn: () => collectionsApi.getAccounts(),
  });

  const accounts = data?.data?.data || data?.data || [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Cuentas Pendientes"
        actions={[
          { label: 'Volver', href: '/collections', variant: 'outline' },
          { label: 'Registrar Pago', href: '/collections/record-payment' },
        ]}
      />

      <div className="rounded-md border bg-white">
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
            ) : accounts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No hay cuentas pendientes
                </TableCell>
              </TableRow>
            ) : (
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              accounts.map((account: any) => (
                <TableRow key={account.id}>
                  <TableCell className="font-medium">
                    {account.customer?.businessName || account.customer?.firstName || account.customerId}
                  </TableCell>
                  <TableCell>{account.invoiceNumber || '—'}</TableCell>
                  <TableCell>${(account.amount || 0).toFixed(2)}</TableCell>
                  <TableCell>
                    {account.dueDate ? new Date(account.dueDate).toLocaleDateString('es-MX') : '—'}
                  </TableCell>
                  <TableCell>
                    {account.daysOverdue ? (
                      <Badge variant="destructive">{account.daysOverdue} días</Badge>
                    ) : (
                      <Badge variant="default">Al día</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm" asChild>
                      <Link href="/collections/record-payment">Pagar</Link>
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
