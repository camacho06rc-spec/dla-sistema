'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { inventoryApi } from '@/lib/api/inventory';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/shared/PageHeader';

const schema = z.object({
  productId: z.string().min(1, 'Producto requerido'),
  branchId: z.string().min(1, 'Sucursal requerida'),
  movementType: z.enum(['IN', 'OUT', 'ADJUSTMENT']),
  boxesDelta: z.number().optional(),
  piecesDelta: z.number().optional(),
  reason: z.string().min(3, 'Razón mínimo 3 caracteres'),
  referenceId: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function AdjustInventoryPage() {
  const router = useRouter();
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { movementType: 'ADJUSTMENT' },
  });

  const mutation = useMutation({
    mutationFn: inventoryApi.adjust,
    onSuccess: () => router.push('/inventory'),
  });

  const onSubmit = (data: FormData) => mutation.mutate(data);

  return (
    <div className="space-y-6">
      <PageHeader title="Ajustar Inventario" actions={[{ label: 'Volver', href: '/inventory', variant: 'outline' }]} />

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Nuevo Movimiento de Inventario</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>ID de Producto</Label>
                <Input {...register('productId')} placeholder="UUID del producto" />
                {errors.productId && <p className="text-sm text-red-500">{errors.productId.message}</p>}
              </div>
              <div className="space-y-2">
                <Label>ID de Sucursal</Label>
                <Input {...register('branchId')} placeholder="UUID de la sucursal" />
                {errors.branchId && <p className="text-sm text-red-500">{errors.branchId.message}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Tipo de Movimiento</Label>
              <select {...register('movementType')} className="w-full border rounded-md px-3 py-2 text-sm">
                <option value="IN">Entrada (IN)</option>
                <option value="OUT">Salida (OUT)</option>
                <option value="ADJUSTMENT">Ajuste</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Delta Cajas</Label>
                <Input type="number" {...register('boxesDelta', { valueAsNumber: true })} placeholder="0" />
              </div>
              <div className="space-y-2">
                <Label>Delta Piezas</Label>
                <Input type="number" {...register('piecesDelta', { valueAsNumber: true })} placeholder="0" />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Razón</Label>
              <Input {...register('reason')} placeholder="Motivo del ajuste" />
              {errors.reason && <p className="text-sm text-red-500">{errors.reason.message}</p>}
            </div>

            <div className="space-y-2">
              <Label>ID de Referencia (opcional)</Label>
              <Input {...register('referenceId')} placeholder="Número de orden, factura, etc." />
            </div>

            {mutation.isError && (
              <p className="text-sm text-red-500">Error al guardar el ajuste</p>
            )}

            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? 'Guardando...' : 'Guardar Ajuste'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
