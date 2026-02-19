'use client';

import { useQuery } from '@tanstack/react-query';
import { inventoryApi } from '@/lib/api/inventory';
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
import { Plus, Settings } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';

export default function InventoryPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['inventory'],
    queryFn: () => inventoryApi.getAll(),
  });

  const items = data?.data?.data || data?.data || [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Inventario"
        description="Gestión de stock por producto y sucursal"
        actions={[
          { label: 'Reglas de Stock', href: '/inventory/stock-rules', variant: 'outline' },
          { label: 'Alertas', href: '/inventory/alerts', variant: 'outline' },
          { label: 'Ajustar Inventario', href: '/inventory/adjust', icon: <Plus className="h-4 w-4" /> },
        ]}
      />

      <div className="rounded-md border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Producto</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>Sucursal</TableHead>
              <TableHead>Cajas</TableHead>
              <TableHead>Piezas</TableHead>
              <TableHead>Total Piezas</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8">
                  Cargando...
                </TableCell>
              </TableRow>
            ) : items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  No hay registros de inventario
                </TableCell>
              </TableRow>
            ) : (
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              items.map((item: any) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.product?.name || item.productId}</TableCell>
                  <TableCell>{item.product?.sku}</TableCell>
                  <TableCell>{item.branch?.name || item.branchId}</TableCell>
                  <TableCell>{item.stockBoxes ?? 0}</TableCell>
                  <TableCell>{item.stockPieces ?? 0}</TableCell>
                  <TableCell>{item.totalPieces ?? 0}</TableCell>
                  <TableCell>
                    <Badge variant={item.isLowStock ? 'destructive' : 'default'}>
                      {item.isLowStock ? 'Stock Bajo' : 'OK'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm" asChild>
                      <Link href="/inventory/adjust">Ajustar</Link>
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
