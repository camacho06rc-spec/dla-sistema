'use client';

import { useQuery } from '@tanstack/react-query';
import { cashRegisterApi } from '@/lib/api/cashRegister';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatsCard } from '@/components/shared/StatsCard';
import { use } from 'react';

interface Props {
  params: Promise<{ id: string }>;
}

export default function CashRegisterSessionPage({ params }: Props) {
  const { id } = use(params);

  const { data: sessionData, isLoading } = useQuery({
    queryKey: ['cash-register-session', id],
    queryFn: () => cashRegisterApi.getById(id),
  });

  const { data: statsData } = useQuery({
    queryKey: ['cash-register-stats', id],
    queryFn: () => cashRegisterApi.getStats(id),
  });

  const session = sessionData?.data;
  const stats = statsData?.data;

  return (
    <div className="space-y-6">
      <PageHeader
        title={isLoading ? 'Cargando...' : `Sesión de Caja`}
        actions={[
          { label: 'Volver', href: '/cash-register', variant: 'outline' },
          ...(session?.status === 'OPEN' ? [{ label: 'Cerrar Sesión', href: `/cash-register/${id}/close`, variant: 'destructive' as const }] : []),
        ]}
      />

      {session && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              {session.sessionCode || id.substring(0, 8)}
              <Badge variant={session.status === 'OPEN' ? 'default' : 'secondary'}>
                {session.status === 'OPEN' ? 'Abierta' : 'Cerrada'}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Sucursal</p>
              <p className="font-medium">{session.branch?.name || session.branchId}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Usuario</p>
              <p className="font-medium">{session.user?.firstName || '—'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Apertura</p>
              <p className="font-medium">{session.openedAt ? new Date(session.openedAt).toLocaleString('es-MX') : '—'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Cierre</p>
              <p className="font-medium">{session.closedAt ? new Date(session.closedAt).toLocaleString('es-MX') : '—'}</p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-4">
        <StatsCard title="Pedidos" value={stats?.ordersCount ?? 0} />
        <StatsCard title="Efectivo Cobrado" value={`$${(stats?.cashCollected || 0).toFixed(2)}`} />
        <StatsCard title="Transferencias" value={`$${(stats?.transfersTotal || 0).toFixed(2)}`} />
        <StatsCard title="Diferencia" value={`$${(stats?.difference || 0).toFixed(2)}`} />
      </div>
    </div>
  );
}
