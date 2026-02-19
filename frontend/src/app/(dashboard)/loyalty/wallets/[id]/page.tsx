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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatsCard } from '@/components/shared/StatsCard';
import { use } from 'react';

const schema = z.object({
  points: z.number().int('Debe ser entero'),
  reason: z.string().min(3, 'Razón mínimo 3 caracteres'),
});

type FormData = z.infer<typeof schema>;

interface Props {
  params: Promise<{ id: string }>;
}

export default function WalletDetailsPage({ params }: Props) {
  const { id } = use(params);
  const queryClient = useQueryClient();

  const { data: walletData, isLoading } = useQuery({
    queryKey: ['loyalty-wallet', id],
    queryFn: () => loyaltyApi.getWallet(id),
  });

  const { data: movementsData } = useQuery({
    queryKey: ['loyalty-wallet-movements', id],
    queryFn: () => loyaltyApi.getMovements(id),
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const adjustMutation = useMutation({
    mutationFn: (data: FormData) => loyaltyApi.adjustPoints(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loyalty-wallet', id] });
      queryClient.invalidateQueries({ queryKey: ['loyalty-wallet-movements', id] });
      reset();
    },
  });

  const wallet = walletData?.data;
  const movements = movementsData?.data?.data || movementsData?.data || [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Billetera de Puntos"
        actions={[{ label: 'Volver a Billeteras', href: '/loyalty/wallets', variant: 'outline' }]}
      />

      {!isLoading && wallet && (
        <div className="grid gap-4 md:grid-cols-3">
          <StatsCard title="Puntos Totales" value={(wallet.totalPoints || 0).toLocaleString()} />
          <StatsCard title="Puntos Disponibles" value={(wallet.availablePoints || 0).toLocaleString()} />
          <StatsCard title="Puntos Expirados" value={(wallet.expiredPoints || 0).toLocaleString()} />
        </div>
      )}

      <Card className="max-w-md">
        <CardHeader>
          <CardTitle>Ajustar Puntos</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit((data) => adjustMutation.mutate(data))} className="space-y-4">
            <div className="space-y-2">
              <Label>Puntos (positivo para agregar, negativo para quitar)</Label>
              <Input type="number" {...register('points', { valueAsNumber: true })} placeholder="0" />
              {errors.points && <p className="text-sm text-red-500">{errors.points.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>Razón</Label>
              <Input {...register('reason')} placeholder="Motivo del ajuste" />
              {errors.reason && <p className="text-sm text-red-500">{errors.reason.message}</p>}
            </div>
            <Button type="submit" disabled={adjustMutation.isPending}>
              {adjustMutation.isPending ? 'Guardando...' : 'Ajustar Puntos'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="rounded-md border bg-white">
        <div className="p-4 font-semibold border-b">Movimientos</div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fecha</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Puntos</TableHead>
              <TableHead>Referencia</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {movements.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                  No hay movimientos
                </TableCell>
              </TableRow>
            ) : (
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              movements.map((m: any) => (
                <TableRow key={m.id}>
                  <TableCell>{m.createdAt ? new Date(m.createdAt).toLocaleDateString('es-MX') : '—'}</TableCell>
                  <TableCell>
                    <Badge variant={m.points > 0 ? 'default' : 'destructive'}>{m.type}</Badge>
                  </TableCell>
                  <TableCell className={m.points > 0 ? 'text-green-600' : 'text-red-600'}>
                    {m.points > 0 ? '+' : ''}{m.points}
                  </TableCell>
                  <TableCell>{m.reference || m.reason || '—'}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
