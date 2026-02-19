'use client';

import { useQuery } from '@tanstack/react-query';
import { collectionsApi } from '@/lib/api/collections';
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

export default function PaymentsHistoryPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['collections-payments'],
    queryFn: () => collectionsApi.getPayments(),
  });

  const payments = data?.data?.data || data?.data || [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Historial de Pagos"
        actions={[
          { label: 'Volver', href: '/collections', variant: 'outline' },
          { label: 'Registrar Pago', href: '/collections/record-payment' },
        ]}
      />

      <div className="rounded-md border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fecha</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Factura</TableHead>
              <TableHead>Monto</TableHead>
              <TableHead>Método</TableHead>
              <TableHead>Verificado Por</TableHead>
              <TableHead>Estado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">Cargando...</TableCell>
              </TableRow>
            ) : payments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No hay pagos registrados
                </TableCell>
              </TableRow>
            ) : (
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              payments.map((payment: any) => (
                <TableRow key={payment.id}>
                  <TableCell>
                    {payment.paymentDate ? new Date(payment.paymentDate).toLocaleDateString('es-MX') : '—'}
                  </TableCell>
                  <TableCell className="font-medium">
                    {payment.customer?.businessName || payment.customer?.firstName || '—'}
                  </TableCell>
                  <TableCell>{payment.invoiceNumber || '—'}</TableCell>
                  <TableCell>${(payment.amount || 0).toFixed(2)}</TableCell>
                  <TableCell>{payment.paymentMethod || '—'}</TableCell>
                  <TableCell>{payment.verifiedBy?.firstName || '—'}</TableCell>
                  <TableCell>
                    <Badge variant={payment.isVerified ? 'default' : 'secondary'}>
                      {payment.isVerified ? 'Verificado' : 'Pendiente'}
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
