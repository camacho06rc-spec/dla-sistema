'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { customersApi } from '@/lib/api/customers';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function NewCustomerPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    businessName: '',
    email: '',
    phone: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await customersApi.create(form);
      router.push('/customers');
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { message?: string } } };
      setError(axiosError.response?.data?.message || 'Error al crear cliente');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" asChild>
          <Link href="/customers">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">Nuevo Cliente</h1>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Información del Cliente</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Nombre</label>
                <Input
                  value={form.firstName}
                  onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                  placeholder="Juan"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Apellido</label>
                <Input
                  value={form.lastName}
                  onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                  placeholder="Pérez"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Nombre del Negocio</label>
              <Input
                value={form.businessName}
                onChange={(e) => setForm({ ...form, businessName: e.target.value })}
                placeholder="Abarrotes El Buen Precio"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="juan@ejemplo.com"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Teléfono</label>
              <Input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="+52 123 456 7890"
                required
              />
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <div className="flex gap-4">
              <Button type="submit" disabled={loading}>
                {loading ? 'Guardando...' : 'Guardar Cliente'}
              </Button>
              <Button type="button" variant="outline" asChild>
                <Link href="/customers">Cancelar</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
