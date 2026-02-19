'use client';

import { useQuery, useMutation } from '@tanstack/react-query';
import { promotionsApi } from '@/lib/api/promotions';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/shared/PageHeader';
import { use, useEffect } from 'react';

const schema = z.object({
  name: z.string().min(1, 'Nombre requerido'),
  type: z.enum(['DISCOUNT_PERCENTAGE', 'DISCOUNT_FIXED', 'BUY_X_GET_Y', 'FREE_PRODUCT']),
  discountValue: z.number().optional(),
  minPurchaseAmount: z.number().optional(),
  validFrom: z.string().min(1),
  validTo: z.string().min(1),
  maxUses: z.number().optional(),
  maxUsesPerCustomer: z.number().optional(),
});

type FormData = z.infer<typeof schema>;

interface Props {
  params: Promise<{ id: string }>;
}

export default function EditPromotionPage({ params }: Props) {
  const { id } = use(params);
  const router = useRouter();

  const { data } = useQuery({
    queryKey: ['promotion', id],
    queryFn: () => promotionsApi.getById(id),
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    const promo = data?.data;
    if (promo) {
      reset({
        name: promo.name,
        type: promo.type,
        discountValue: promo.discountValue,
        minPurchaseAmount: promo.minPurchaseAmount,
        validFrom: promo.validFrom?.split('T')[0],
        validTo: promo.validTo?.split('T')[0],
        maxUses: promo.maxUses,
        maxUsesPerCustomer: promo.maxUsesPerCustomer,
      });
    }
  }, [data, reset]);

  const mutation = useMutation({
    mutationFn: (formData: FormData) => promotionsApi.update(id, formData),
    onSuccess: () => router.push('/promotions'),
  });

  const onSubmit = (data: FormData) => mutation.mutate(data);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Editar Promoción"
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
              <Input {...register('name')} />
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
                <Input type="number" step="0.01" {...register('discountValue', { valueAsNumber: true })} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Válida Desde</Label>
                <Input type="date" {...register('validFrom')} />
              </div>
              <div className="space-y-2">
                <Label>Válida Hasta</Label>
                <Input type="date" {...register('validTo')} />
              </div>
            </div>

            {mutation.isError && <p className="text-sm text-red-500">Error al actualizar</p>}

            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
