'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { promotionsApi } from '@/lib/api/promotions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/shared/PageHeader';

const schema = z.object({
  name: z.string().min(1, 'Nombre requerido'),
  type: z.enum(['DISCOUNT_PERCENTAGE', 'DISCOUNT_FIXED', 'BUY_X_GET_Y', 'FREE_PRODUCT']),
  discountValue: z.number().optional(),
  minPurchaseAmount: z.number().optional(),
  validFrom: z.string().min(1, 'Fecha de inicio requerida'),
  validTo: z.string().min(1, 'Fecha de fin requerida'),
  maxUses: z.number().optional(),
  maxUsesPerCustomer: z.number().optional(),
});

type FormData = z.infer<typeof schema>;

export default function NewPromotionPage() {
  const router = useRouter();
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { type: 'DISCOUNT_PERCENTAGE' },
  });

  const mutation = useMutation({
    mutationFn: promotionsApi.create,
    onSuccess: () => router.push('/promotions'),
  });

  const onSubmit = (data: FormData) => mutation.mutate(data);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Nueva Promoción"
        actions={[{ label: 'Volver', href: '/promotions', variant: 'outline' }]}
      />

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Datos de la Promoción</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label>Nombre</Label>
              <Input {...register('name')} placeholder="Nombre de la promoción" />
              {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tipo</Label>
                <select {...register('type')} className="w-full border rounded-md px-3 py-2 text-sm">
                  <option value="DISCOUNT_PERCENTAGE">Descuento Porcentaje</option>
                  <option value="DISCOUNT_FIXED">Descuento Fijo</option>
                  <option value="BUY_X_GET_Y">Compra X lleva Y</option>
                  <option value="FREE_PRODUCT">Producto Gratis</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Valor del Descuento</Label>
                <Input type="number" step="0.01" {...register('discountValue', { valueAsNumber: true })} placeholder="0" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Válida Desde</Label>
                <Input type="date" {...register('validFrom')} />
                {errors.validFrom && <p className="text-sm text-red-500">{errors.validFrom.message}</p>}
              </div>
              <div className="space-y-2">
                <Label>Válida Hasta</Label>
                <Input type="date" {...register('validTo')} />
                {errors.validTo && <p className="text-sm text-red-500">{errors.validTo.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Monto Mínimo de Compra</Label>
                <Input type="number" step="0.01" {...register('minPurchaseAmount', { valueAsNumber: true })} placeholder="0" />
              </div>
              <div className="space-y-2">
                <Label>Máximo de Usos</Label>
                <Input type="number" {...register('maxUses', { valueAsNumber: true })} placeholder="Sin límite" />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Máximo Usos por Cliente</Label>
              <Input type="number" {...register('maxUsesPerCustomer', { valueAsNumber: true })} placeholder="Sin límite" />
            </div>

            {mutation.isError && (
              <p className="text-sm text-red-500">Error al crear la promoción</p>
            )}

            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? 'Creando...' : 'Crear Promoción'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
