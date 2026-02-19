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
import { PageHeader } from '@/components/shared/PageHeader';

export default function LoyaltyWalletsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['loyalty-wallets'],
    queryFn: () => loyaltyApi.getWallets(),
  });

  const wallets = data?.data?.data || data?.data || [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Billeteras de Puntos"
        description="Puntos de fidelidad por cliente"
        actions={[{ label: 'Volver', href: '/loyalty', variant: 'outline' }]}
      />

      <div className="rounded-md border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cliente</TableHead>
              <TableHead>Puntos Totales</TableHead>
              <TableHead>Puntos Disponibles</TableHead>
              <TableHead>Puntos Expirados</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">Cargando...</TableCell>
              </TableRow>
            ) : wallets.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  No hay billeteras registradas
                </TableCell>
              </TableRow>
            ) : (
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              wallets.map((wallet: any) => (
                <TableRow key={wallet.id}>
                  <TableCell className="font-medium">
                    {wallet.customer?.businessName || wallet.customer?.firstName || wallet.customerId}
                  </TableCell>
                  <TableCell>{(wallet.totalPoints || 0).toLocaleString()}</TableCell>
                  <TableCell>{(wallet.availablePoints || 0).toLocaleString()}</TableCell>
                  <TableCell>{(wallet.expiredPoints || 0).toLocaleString()}</TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/loyalty/wallets/${wallet.id}`}>Ver</Link>
                    </Button>
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
