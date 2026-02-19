'use client';

import { useQuery, useMutation } from '@tanstack/react-query';
import { expensesApi } from '@/lib/api/expenses';
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

const EXPENSE_CATEGORIES = [
  'SUPPLIES', 'UTILITIES', 'RENT', 'PAYROLL', 'MAINTENANCE',
  'TRANSPORT', 'MARKETING', 'MISCELLANEOUS',
];

const schema = z.object({
  category: z.string().optional(),
  amount: z.number().positive('El monto debe ser mayor a 0').optional(),
  description: z.string().min(3, 'Mínimo 3 caracteres').optional(),
  expenseDate: z.string().optional(),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface Props {
  params: Promise<{ id: string }>;
}

export default function EditExpensePage({ params }: Props) {
  const { id } = use(params);
  const router = useRouter();

  const { data } = useQuery({
    queryKey: ['expense', id],
    queryFn: () => expensesApi.getById(id),
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    const expense = data?.data;
    if (expense) {
      reset({
        category: expense.category,
        amount: expense.amount,
        description: expense.description,
        expenseDate: expense.expenseDate?.split('T')[0],
        notes: expense.notes,
      });
    }
  }, [data, reset]);

  const mutation = useMutation({
    mutationFn: (formData: FormData) => expensesApi.update(id, formData),
    onSuccess: () => router.push('/expenses'),
  });

  const onSubmit = (data: FormData) => mutation.mutate(data);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Editar Gasto"
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
                <Label>Categoría</Label>
                <select {...register('category')} className="w-full border rounded-md px-3 py-2 text-sm">
                  {EXPENSE_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Monto ($)</Label>
                <Input type="number" step="0.01" {...register('amount', { valueAsNumber: true })} />
                {errors.amount && <p className="text-sm text-red-500">{errors.amount.message}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Descripción</Label>
              <Input {...register('description')} />
              {errors.description && <p className="text-sm text-red-500">{errors.description.message}</p>}
            </div>

            <div className="space-y-2">
              <Label>Fecha</Label>
              <Input type="date" {...register('expenseDate')} />
            </div>

            <div className="space-y-2">
              <Label>Notas</Label>
              <Input {...register('notes')} />
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
