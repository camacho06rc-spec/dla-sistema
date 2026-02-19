'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { collectionsApi } from '@/lib/api/collections';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/shared/PageHeader';

const schema = z.object({
  customerId: z.string().min(1, 'Cliente requerido'),
  accountId: z.string().min(1, 'Cuenta requerida'),
  amount: z.number().positive('El monto debe ser mayor a 0'),
  paymentMethod: z.string().min(1, 'Método de pago requerido'),
  paymentDate: z.string().min(1, 'Fecha requerida'),
  reference: z.string().optional(),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function RecordPaymentPage() {
  const router = useRouter();
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { paymentDate: new Date().toISOString().split('T')[0] },
  });

  const mutation = useMutation({
    mutationFn: collectionsApi.recordPayment,
    onSuccess: () => router.push('/collections/payments'),
  });

  const onSubmit = (data: FormData) => mutation.mutate(data);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Registrar Pago"
        actions={[{ label: 'Volver', href: '/collections', variant: 'outline' }]}
      />

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Datos del Pago</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>ID de Cliente</Label>
                <Input {...register('customerId')} placeholder="UUID del cliente" />
                {errors.customerId && <p className="text-sm text-red-500">{errors.customerId.message}</p>}
              </div>
              <div className="space-y-2">
                <Label>ID de Cuenta</Label>
                <Input {...register('accountId')} placeholder="UUID de la cuenta" />
                {errors.accountId && <p className="text-sm text-red-500">{errors.accountId.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Monto</Label>
                <Input type="number" step="0.01" {...register('amount', { valueAsNumber: true })} placeholder="0.00" />
                {errors.amount && <p className="text-sm text-red-500">{errors.amount.message}</p>}
              </div>
              <div className="space-y-2">
                <Label>Método de Pago</Label>
                <select {...register('paymentMethod')} className="w-full border rounded-md px-3 py-2 text-sm">
                  <option value="">Seleccionar...</option>
                  <option value="CASH">Efectivo</option>
                  <option value="TRANSFER">Transferencia</option>
                  <option value="CARD">Tarjeta</option>
                  <option value="CHECK">Cheque</option>
                </select>
                {errors.paymentMethod && <p className="text-sm text-red-500">{errors.paymentMethod.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Fecha de Pago</Label>
                <Input type="date" {...register('paymentDate')} />
                {errors.paymentDate && <p className="text-sm text-red-500">{errors.paymentDate.message}</p>}
              </div>
              <div className="space-y-2">
                <Label>Referencia (opcional)</Label>
                <Input {...register('reference')} placeholder="Número de referencia" />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Notas (opcional)</Label>
              <Input {...register('notes')} placeholder="Observaciones adicionales" />
            </div>

            {mutation.isError && (
              <p className="text-sm text-red-500">Error al registrar el pago</p>
            )}

            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? 'Guardando...' : 'Registrar Pago'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
