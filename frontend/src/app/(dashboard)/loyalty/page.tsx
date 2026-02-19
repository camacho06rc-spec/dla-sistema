'use client';

import { useQuery } from '@tanstack/react-query';
import { loyaltyApi } from '@/lib/api/loyalty';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
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
import { Star, Plus } from 'lucide-react';

export default function LoyaltyPage() {
  const { data: rulesData, isLoading } = useQuery({
    queryKey: ['loyalty-rules'],
    queryFn: () => loyaltyApi.getRules(),
  });

  const { data: walletsData } = useQuery({
    queryKey: ['loyalty-wallets-summary'],
    queryFn: () => loyaltyApi.getWallets(),
  });

  const rules = rulesData?.data?.data || rulesData?.data || [];
  const wallets = walletsData?.data?.data || walletsData?.data || [];
  const totalPoints = wallets.reduce((sum: number, w: { totalPoints?: number }) => sum + (w.totalPoints || 0), 0);
  const redeemedPoints = wallets.reduce((sum: number, w: { redeemedPoints?: number }) => sum + (w.redeemedPoints || 0), 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Programa de Lealtad"
        description="Gestión de puntos y recompensas"
        actions={[
          { label: 'Billeteras', href: '/loyalty/wallets', variant: 'outline' },
          { label: 'Canjear Puntos', href: '/loyalty/redeem', variant: 'outline' },
          { label: 'Nueva Regla', href: '/loyalty/rules', icon: <Plus className="h-4 w-4" /> },
        ]}
      />

      <div className="grid gap-4 md:grid-cols-3">
        <StatsCard
          title="Miembros Activos"
          value={wallets.length}
          icon={<Star className="h-4 w-4" />}
        />
        <StatsCard title="Puntos Emitidos" value={totalPoints.toLocaleString()} />
        <StatsCard title="Puntos Canjeados" value={redeemedPoints.toLocaleString()} />
      </div>

      <div className="rounded-md border bg-white">
        <div className="p-4 font-semibold border-b">Reglas de Puntos</div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Puntos por $</TableHead>
              <TableHead>Compra Mínima</TableHead>
              <TableHead>Tier</TableHead>
              <TableHead>Estado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">Cargando...</TableCell>
              </TableRow>
            ) : rules.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  No hay reglas configuradas
                </TableCell>
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
