'use client';

import { useQuery, useMutation } from '@tanstack/react-query';
import { cashRegisterApi } from '@/lib/api/cashRegister';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatsCard } from '@/components/shared/StatsCard';
import { use } from 'react';

const schema = z.object({
  finalCash: z.number().min(0, 'El efectivo no puede ser negativo'),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface Props {
  params: Promise<{ id: string }>;
}

export default function CloseCashRegisterPage({ params }: Props) {
  const { id } = use(params);
  const router = useRouter();

  const { data: statsData } = useQuery({
    queryKey: ['cash-register-stats', id],
    queryFn: () => cashRegisterApi.getStats(id),
  });

  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { finalCash: 0 },
  });

  const mutation = useMutation({
    mutationFn: (data: FormData) => cashRegisterApi.close(id, data),
    onSuccess: () => router.push('/cash-register'),
  });

  const stats = statsData?.data;
  const finalCash = watch('finalCash') || 0;
  const expectedCash = stats?.expectedCash || 0;
  const difference = finalCash - expectedCash;

  const onSubmit = (data: FormData) => mutation.mutate(data);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Cerrar Sesión de Caja"
        actions={[{ label: 'Volver', href: '/cash-register', variant: 'outline' }]}
      />

      <div className="grid gap-4 md:grid-cols-3">
        <StatsCard title="Pedidos" value={stats?.ordersCount ?? 0} />
        <StatsCard title="Efectivo Esperado" value={`$${(expectedCash).toFixed(2)}`} />
        <StatsCard
          title="Diferencia"
          value={`${difference >= 0 ? '+' : ''}$${difference.toFixed(2)}`}
          description={difference >= 0 ? 'Sobrante' : 'Faltante'}
        />
      </div>

      <Card className="max-w-md">
        <CardHeader>
          <CardTitle>Datos de Cierre</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label>Efectivo Final ($)</Label>
              <Input
                type="number"
                step="0.01"
                {...register('finalCash', { valueAsNumber: true })}
                placeholder="0.00"
              />
              {errors.finalCash && <p className="text-sm text-red-500">{errors.finalCash.message}</p>}
            </div>

            <div className="p-3 rounded-md border">
              <p className="text-sm text-muted-foreground">Efectivo esperado: <span className="font-medium">${expectedCash.toFixed(2)}</span></p>
              <p className={`text-sm font-medium ${difference >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                Diferencia: {difference >= 0 ? '+' : ''}${difference.toFixed(2)}
              </p>
            </div>

            <div className="space-y-2">
              <Label>Notas (opcional)</Label>
              <Input {...register('notes')} placeholder="Observaciones de cierre" />
            </div>

            {mutation.isError && (
              <p className="text-sm text-red-500">Error al cerrar la sesión</p>
            )}

            <Button type="submit" disabled={mutation.isPending} variant="destructive">
              {mutation.isPending ? 'Cerrando...' : 'Cerrar Sesión'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
