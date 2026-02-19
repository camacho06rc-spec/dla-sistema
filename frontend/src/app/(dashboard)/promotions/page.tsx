'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { promotionsApi } from '@/lib/api/promotions';
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
import { Plus, ToggleLeft } from 'lucide-react';

const typeLabels: Record<string, string> = {
  DISCOUNT_PERCENTAGE: 'Descuento %',
  DISCOUNT_FIXED: 'Descuento Fijo',
  BUY_X_GET_Y: 'Compra X lleva Y',
  FREE_PRODUCT: 'Producto Gratis',
};

export default function PromotionsPage() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['promotions'],
    queryFn: () => promotionsApi.getAll(),
  });

  const toggleMutation = useMutation({
    mutationFn: (id: string) => promotionsApi.toggleActive(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['promotions'] }),
  });

  const promotions = data?.data?.data || data?.data || [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Promociones"
        description="Gestión de descuentos y promociones"
        actions={[
          { label: 'Nueva Promoción', href: '/promotions/new', icon: <Plus className="h-4 w-4" /> },
        ]}
      />

      <div className="rounded-md border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Descuento</TableHead>
              <TableHead>Válida Desde</TableHead>
              <TableHead>Válida Hasta</TableHead>
              <TableHead>Usos</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8">Cargando...</TableCell>
              </TableRow>
            ) : promotions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  No hay promociones registradas
                </TableCell>
              </TableRow>
            ) : (
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              promotions.map((promo: any) => (
                <TableRow key={promo.id}>
                  <TableCell className="font-medium">{promo.name}</TableCell>
                  <TableCell>{typeLabels[promo.type] || promo.type}</TableCell>
                  <TableCell>
                    {promo.type === 'DISCOUNT_PERCENTAGE'
                      ? `${promo.discountValue}%`
                      : `$${promo.discountValue}`}
                  </TableCell>
                  <TableCell>
                    {promo.validFrom ? new Date(promo.validFrom).toLocaleDateString('es-MX') : '—'}
                  </TableCell>
                  <TableCell>
                    {promo.validTo ? new Date(promo.validTo).toLocaleDateString('es-MX') : '—'}
                  </TableCell>
                  <TableCell>{promo.usageCount ?? 0}</TableCell>
                  <TableCell>
                    <Badge variant={promo.isActive ? 'default' : 'secondary'}>
                      {promo.isActive ? 'Activa' : 'Inactiva'}
                    </Badge>
                  </TableCell>
                  <TableCell className="flex gap-1">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/promotions/${promo.id}/edit`}>Editar</Link>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleMutation.mutate(promo.id)}
                    >
                      <ToggleLeft className="h-4 w-4" />
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
