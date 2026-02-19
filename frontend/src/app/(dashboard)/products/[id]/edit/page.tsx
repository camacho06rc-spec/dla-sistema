'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { productsApi } from '@/lib/api/products';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    name: '',
    sku: '',
    description: '',
    piecesPerBox: 1,
  });

  useEffect(() => {
    const loadProduct = async () => {
      try {
        const response = await productsApi.getById(id);
        const product = response.data;
        setForm({
          name: product.name,
          sku: product.sku,
          description: product.description || '',
          piecesPerBox: product.piecesPerBox,
        });
      } catch {
        setError('Error al cargar el producto');
      } finally {
        setFetching(false);
      }
    };

    loadProduct();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await productsApi.update(id, form);
      router.push('/products');
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { message?: string } } };
      setError(axiosError.response?.data?.message || 'Error al actualizar producto');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return <div className="p-6">Cargando...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" asChild>
          <Link href="/products">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">Editar Producto</h1>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Información del Producto</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Nombre</label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Nombre del producto"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">SKU</label>
                <Input
                  value={form.sku}
                  onChange={(e) => setForm({ ...form, sku: e.target.value })}
                  placeholder="CC600ET"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Descripción</label>
              <Input
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Descripción del producto"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Piezas por Caja</label>
              <Input
                type="number"
                value={form.piecesPerBox}
                onChange={(e) => setForm({ ...form, piecesPerBox: parseInt(e.target.value) })}
                min={1}
                required
              />
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <div className="flex gap-4">
              <Button type="submit" disabled={loading}>
                {loading ? 'Guardando...' : 'Guardar Cambios'}
              </Button>
              <Button type="button" variant="outline" asChild>
                <Link href="/products">Cancelar</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
