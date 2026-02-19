'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { deliveriesApi } from '@/lib/api/deliveries';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/shared/PageHeader';

const schema = z.object({
  name: z.string().min(1, 'Nombre requerido'),
  branchId: z.string().min(1, 'Sucursal requerida'),
  routeDate: z.string().min(1, 'Fecha requerida'),
  driverId: z.string().optional(),
  vehicle: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function NewRoutePage() {
  const router = useRouter();
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const mutation = useMutation({
    mutationFn: deliveriesApi.createRoute,
    onSuccess: () => router.push('/deliveries/routes'),
  });

  const onSubmit = (data: FormData) => mutation.mutate(data);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Nueva Ruta de Entrega"
        actions={[{ label: 'Volver', href: '/deliveries/routes', variant: 'outline' }]}
      />

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Datos de la Ruta</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label>Nombre de la Ruta</Label>
              <Input {...register('name')} placeholder="Ej: Ruta Norte - Lunes" />
              {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>ID de Sucursal</Label>
                <Input {...register('branchId')} placeholder="UUID de la sucursal" />
                {errors.branchId && <p className="text-sm text-red-500">{errors.branchId.message}</p>}
              </div>
              <div className="space-y-2">
                <Label>Fecha de Ruta</Label>
                <Input type="date" {...register('routeDate')} />
                {errors.routeDate && <p className="text-sm text-red-500">{errors.routeDate.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>ID de Conductor (opcional)</Label>
                <Input {...register('driverId')} placeholder="UUID del conductor" />
              </div>
              <div className="space-y-2">
                <Label>Vehículo (opcional)</Label>
                <Input {...register('vehicle')} placeholder="Ej: ABC-1234" />
              </div>
            </div>

            {mutation.isError && (
              <p className="text-sm text-red-500">Error al crear la ruta</p>
            )}

            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? 'Creando...' : 'Crear Ruta'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
