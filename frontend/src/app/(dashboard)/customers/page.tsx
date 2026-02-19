'use client';

import { useQuery } from '@tanstack/react-query';
import { customersApi } from '@/lib/api/customers';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
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
import { Customer } from '@/types';

export default function CustomersPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['customers'],
    queryFn: () => customersApi.getAll(),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Clientes</h1>
        <Button asChild>
          <Link href="/customers/new">
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Cliente
          </Link>
        </Button>
      </div>

      <div className="rounded-md border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Código</TableHead>
              <TableHead>Nombre / Empresa</TableHead>
              <TableHead>Teléfono</TableHead>
              <TableHead>Tier</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center">
                  Cargando...
                </TableCell>
              </TableRow>
            ) : (
              data?.data?.data?.map((customer: Customer) => (
                <TableRow key={customer.id}>
                  <TableCell>{customer.code}</TableCell>
                  <TableCell className="font-medium">
                    {customer.businessName || `${customer.firstName} ${customer.lastName}`}
                  </TableCell>
                  <TableCell>{customer.phone}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{customer.tier}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={customer.isActive ? 'default' : 'destructive'}>
                      {customer.isActive ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/customers/${customer.id}/edit`}>Editar</Link>
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
