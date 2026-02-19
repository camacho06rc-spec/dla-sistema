'use client';

import { useQuery } from '@tanstack/react-query';
import { inventoryApi } from '@/lib/api/inventory';
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

export default function StockAlertsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['inventory-alerts'],
    queryFn: () => inventoryApi.getAlerts(),
  });

  const alerts = data?.data?.data || data?.data || [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Alertas de Stock"
        description="Productos con stock por debajo del mínimo"
        actions={[{ label: 'Volver a Inventario', href: '/inventory', variant: 'outline' }]}
      />

      <div className="rounded-md border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Producto</TableHead>
              <TableHead>Sucursal</TableHead>
              <TableHead>Stock Actual</TableHead>
              <TableHead>Stock Mínimo</TableHead>
              <TableHead>Estado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">Cargando...</TableCell>
              </TableRow>
            ) : alerts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  No hay alertas activas
                </TableCell>
              </TableRow>
            ) : (
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              alerts.map((alert: any) => (
                <TableRow key={alert.id}>
                  <TableCell className="font-medium">{alert.product?.name || alert.productId}</TableCell>
                  <TableCell>{alert.branch?.name || alert.branchId}</TableCell>
                  <TableCell>{alert.currentStock}</TableCell>
                  <TableCell>{alert.minStock}</TableCell>
                  <TableCell>
                    <Badge variant="destructive">Stock Bajo</Badge>
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
