'use client';

import { useQuery } from '@tanstack/react-query';
import { productsApi } from '@/lib/api/products';
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
import { Product } from '@/types';

export default function ProductsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: () => productsApi.getAll(),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Productos</h1>
        <Button asChild>
          <Link href="/products/new">
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Producto
          </Link>
        </Button>
      </div>

      <div className="rounded-md border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>SKU</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead>Categoría</TableHead>
              <TableHead>Precio Eventual</TableHead>
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
              data?.data?.data?.map((product: Product) => (
                <TableRow key={product.id}>
                  <TableCell>{product.sku}</TableCell>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>{product.category?.name}</TableCell>
                  <TableCell>${product.prices?.priceEventual}</TableCell>
                  <TableCell>
                    <Badge variant={product.isActive ? 'default' : 'destructive'}>
                      {product.isActive ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/products/${product.id}/edit`}>Editar</Link>
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
