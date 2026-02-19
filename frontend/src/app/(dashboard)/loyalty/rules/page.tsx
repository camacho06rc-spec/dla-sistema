'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { loyaltyApi } from '@/lib/api/loyalty';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { PageHeader } from '@/components/shared/PageHeader';

const schema = z.object({
  name: z.string().min(1, 'Nombre requerido'),
  pointsPerAmountSpent: z.number().positive('Debe ser mayor a 0'),
  minPurchase: z.number().optional(),
  tier: z.string().optional(),
  isActive: z.boolean(),
});

type FormData = z.infer<typeof schema>;

export default function LoyaltyRulesPage() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['loyalty-rules'],
    queryFn: () => loyaltyApi.getRules(),
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { isActive: true },
  });

  const createMutation = useMutation({
    mutationFn: loyaltyApi.createRule,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loyalty-rules'] });
      reset();
    },
  });

  const rules = data?.data?.data || data?.data || [];
  const onSubmit = (data: FormData) => createMutation.mutate(data);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reglas de Lealtad"
        actions={[{ label: 'Volver', href: '/loyalty', variant: 'outline' }]}
      />

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Nueva Regla</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nombre</Label>
                <Input {...register('name')} placeholder="Nombre de la regla" />
                {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
              </div>
              <div className="space-y-2">
                <Label>Puntos por $ gastado</Label>
                <Input type="number" step="0.01" {...register('pointsPerAmountSpent', { valueAsNumber: true })} placeholder="1" />
                {errors.pointsPerAmountSpent && <p className="text-sm text-red-500">{errors.pointsPerAmountSpent.message}</p>}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Compra Mínima</Label>
                <Input type="number" step="0.01" {...register('minPurchase', { valueAsNumber: true })} placeholder="0" />
              </div>
              <div className="space-y-2">
                <Label>Tier (opcional)</Label>
                <select {...register('tier')} className="w-full border rounded-md px-3 py-2 text-sm">
                  <option value="">Todos</option>
                  <option value="EVENTUAL">Eventual</option>
                  <option value="FRECUENTE">Frecuente</option>
                  <option value="VIP">VIP</option>
                </select>
              </div>
            </div>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Guardando...' : 'Crear Regla'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="rounded-md border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Puntos/$</TableHead>
              <TableHead>Mínimo</TableHead>
              <TableHead>Tier</TableHead>
              <TableHead>Estado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">Cargando...</TableCell>
              </TableRow>
            ) : (
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              rules.map((rule: any) => (
                <TableRow key={rule.id}>
                  <TableCell className="font-medium">{rule.name}</TableCell>
                  <TableCell>{rule.pointsPerAmountSpent}</TableCell>
                  <TableCell>${(rule.minPurchase || 0).toFixed(2)}</TableCell>
                  <TableCell>{rule.tier || 'Todos'}</TableCell>
                  <TableCell>
                    <Badge variant={rule.isActive ? 'default' : 'secondary'}>
                      {rule.isActive ? 'Activa' : 'Inactiva'}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
