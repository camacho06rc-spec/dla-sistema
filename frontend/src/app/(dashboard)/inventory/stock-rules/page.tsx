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
import { PageHeader } from '@/components/shared/PageHeader';
import { Plus } from 'lucide-react';

export default function StockRulesPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['stock-rules'],
    queryFn: () => inventoryApi.getStockRules(),
  });

  const rules = data?.data?.data || data?.data || [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reglas de Stock Mínimo"
        description="Define el stock mínimo por producto y sucursal"
        actions={[
          { label: 'Volver', href: '/inventory', variant: 'outline' },
          { label: 'Nueva Regla', href: '/inventory/stock-rules/new', icon: <Plus className="h-4 w-4" /> },
        ]}
      />

      <div className="rounded-md border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Producto</TableHead>
              <TableHead>Sucursal</TableHead>
              <TableHead>Mín. Cajas</TableHead>
              <TableHead>Mín. Piezas</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">Cargando...</TableCell>
              </TableRow>
            ) : rules.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  No hay reglas configuradas
                </TableCell>
              </TableRow>
            ) : (
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              rules.map((rule: any) => (
                <TableRow key={rule.id}>
                  <TableCell className="font-medium">{rule.product?.name || rule.productId}</TableCell>
                  <TableCell>{rule.branch?.name || rule.branchId}</TableCell>
                  <TableCell>{rule.minBoxes}</TableCell>
                  <TableCell>{rule.minPieces}</TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">—</span>
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
