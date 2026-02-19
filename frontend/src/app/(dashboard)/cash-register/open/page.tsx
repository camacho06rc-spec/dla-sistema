'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { cashRegisterApi } from '@/lib/api/cashRegister';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/shared/PageHeader';

const schema = z.object({
  branchId: z.string().min(1, 'Sucursal requerida'),
  initialCash: z.number().min(0, 'El efectivo inicial no puede ser negativo'),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function OpenCashRegisterPage() {
  const router = useRouter();
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { initialCash: 0 },
  });

  const mutation = useMutation({
    mutationFn: cashRegisterApi.open,
    onSuccess: () => router.push('/cash-register'),
  });

  const onSubmit = (data: FormData) => mutation.mutate(data);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Abrir Sesión de Caja"
        actions={[{ label: 'Volver', href: '/cash-register', variant: 'outline' }]}
      />

      <Card className="max-w-md">
        <CardHeader>
          <CardTitle>Datos de Apertura</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label>ID de Sucursal</Label>
              <Input {...register('branchId')} placeholder="UUID de la sucursal" />
              {errors.branchId && <p className="text-sm text-red-500">{errors.branchId.message}</p>}
            </div>

            <div className="space-y-2">
              <Label>Efectivo Inicial ($)</Label>
              <Input
                type="number"
                step="0.01"
                {...register('initialCash', { valueAsNumber: true })}
                placeholder="0.00"
              />
              {errors.initialCash && <p className="text-sm text-red-500">{errors.initialCash.message}</p>}
            </div>

            <div className="space-y-2">
              <Label>Notas (opcional)</Label>
              <Input {...register('notes')} placeholder="Observaciones de apertura" />
            </div>

            {mutation.isError && (
              <p className="text-sm text-red-500">Error al abrir la sesión</p>
            )}

            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? 'Abriendo...' : 'Abrir Sesión'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
