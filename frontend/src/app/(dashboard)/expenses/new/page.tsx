'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { expensesApi } from '@/lib/api/expenses';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/shared/PageHeader';

const EXPENSE_CATEGORIES = [
  'SUPPLIES', 'UTILITIES', 'RENT', 'PAYROLL', 'MAINTENANCE',
  'TRANSPORT', 'MARKETING', 'MISCELLANEOUS',
];

const schema = z.object({
  branchId: z.string().min(1, 'Sucursal requerida'),
  category: z.string().min(1, 'Categoría requerida'),
  amount: z.number().positive('El monto debe ser mayor a 0'),
  description: z.string().min(3, 'Descripción mínimo 3 caracteres'),
  receiptUrl: z.string().url('URL inválida').optional().or(z.literal('')),
  expenseDate: z.string().min(1, 'Fecha requerida'),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function NewExpensePage() {
  const router = useRouter();
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { expenseDate: new Date().toISOString().split('T')[0] },
  });

  const mutation = useMutation({
    mutationFn: expensesApi.create,
    onSuccess: () => router.push('/expenses'),
  });

  const onSubmit = (data: FormData) => {
    const payload = { ...data, receiptUrl: data.receiptUrl || undefined };
    mutation.mutate(payload);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Nuevo Gasto"
        actions={[{ label: 'Volver', href: '/expenses', variant: 'outline' }]}
      />

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Datos del Gasto</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>ID de Sucursal</Label>
                <Input {...register('branchId')} placeholder="UUID de la sucursal" />
                {errors.branchId && <p className="text-sm text-red-500">{errors.branchId.message}</p>}
              </div>
              <div className="space-y-2">
                <Label>Categoría</Label>
                <select {...register('category')} className="w-full border rounded-md px-3 py-2 text-sm">
                  <option value="">Seleccionar...</option>
                  {EXPENSE_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                {errors.category && <p className="text-sm text-red-500">{errors.category.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Monto ($)</Label>
                <Input type="number" step="0.01" {...register('amount', { valueAsNumber: true })} placeholder="0.00" />
                {errors.amount && <p className="text-sm text-red-500">{errors.amount.message}</p>}
              </div>
              <div className="space-y-2">
                <Label>Fecha del Gasto</Label>
                <Input type="date" {...register('expenseDate')} />
                {errors.expenseDate && <p className="text-sm text-red-500">{errors.expenseDate.message}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Descripción</Label>
              <Input {...register('description')} placeholder="Descripción del gasto" />
              {errors.description && <p className="text-sm text-red-500">{errors.description.message}</p>}
            </div>

            <div className="space-y-2">
              <Label>URL del Recibo (opcional)</Label>
              <Input {...register('receiptUrl')} placeholder="https://..." />
              {errors.receiptUrl && <p className="text-sm text-red-500">{errors.receiptUrl.message}</p>}
            </div>

            <div className="space-y-2">
              <Label>Notas (opcional)</Label>
              <Input {...register('notes')} placeholder="Notas adicionales" />
            </div>

            {mutation.isError && (
              <p className="text-sm text-red-500">Error al registrar el gasto</p>
            )}

            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? 'Guardando...' : 'Registrar Gasto'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
