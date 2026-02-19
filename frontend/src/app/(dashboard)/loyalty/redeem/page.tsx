'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { loyaltyApi } from '@/lib/api/loyalty';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/shared/PageHeader';

const schema = z.object({
  customerId: z.string().min(1, 'Cliente requerido'),
  points: z.number().positive('Puntos debe ser mayor a 0'),
  orderId: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function RedeemPointsPage() {
  const router = useRouter();
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const mutation = useMutation({
    mutationFn: loyaltyApi.redeem,
    onSuccess: () => router.push('/loyalty/wallets'),
  });

  const onSubmit = (data: FormData) => mutation.mutate(data);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Canjear Puntos"
        actions={[{ label: 'Volver', href: '/loyalty', variant: 'outline' }]}
      />

      <Card className="max-w-md">
        <CardHeader>
          <CardTitle>Canjear Puntos de Lealtad</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label>ID de Cliente</Label>
              <Input {...register('customerId')} placeholder="UUID del cliente" />
              {errors.customerId && <p className="text-sm text-red-500">{errors.customerId.message}</p>}
            </div>

            <div className="space-y-2">
              <Label>Puntos a Canjear</Label>
              <Input type="number" {...register('points', { valueAsNumber: true })} placeholder="100" />
              {errors.points && <p className="text-sm text-red-500">{errors.points.message}</p>}
            </div>

            <div className="space-y-2">
              <Label>ID de Pedido (opcional)</Label>
              <Input {...register('orderId')} placeholder="UUID del pedido" />
            </div>

            {mutation.isError && (
              <p className="text-sm text-red-500">Error al canjear los puntos</p>
            )}

            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? 'Canjeando...' : 'Canjear Puntos'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
