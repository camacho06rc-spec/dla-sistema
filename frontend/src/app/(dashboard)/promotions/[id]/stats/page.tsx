'use client';

import { useQuery } from '@tanstack/react-query';
import { promotionsApi } from '@/lib/api/promotions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChartComponent } from '@/components/charts/LineChartComponent';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatsCard } from '@/components/shared/StatsCard';
import { use } from 'react';

interface Props {
  params: Promise<{ id: string }>;
}

export default function PromotionStatsPage({ params }: Props) {
  const { id } = use(params);

  const { data, isLoading } = useQuery({
    queryKey: ['promotion-stats', id],
    queryFn: () => promotionsApi.getStatistics(id),
  });

  const stats = data?.data;
  const usageData = stats?.usageOverTime || [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Estadísticas de Promoción"
        actions={[{ label: 'Volver', href: '/promotions', variant: 'outline' }]}
      />

      {isLoading ? (
        <p>Cargando estadísticas...</p>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-3">
            <StatsCard title="Total de Usos" value={stats?.totalUses ?? 0} />
            <StatsCard
              title="Descuento Total Otorgado"
              value={`$${(stats?.totalDiscountGiven || 0).toFixed(2)}`}
            />
            <StatsCard
              title="Impacto en Ingresos"
              value={`$${(stats?.revenueImpact || 0).toFixed(2)}`}
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Uso a lo Largo del Tiempo</CardTitle>
            </CardHeader>
            <CardContent>
              <LineChartComponent
                data={usageData}
                lines={[{ dataKey: 'uses', name: 'Usos' }]}
                xAxisKey="date"
              />
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
