'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function NewOrderPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" asChild>
          <Link href="/orders">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">Nuevo Pedido</h1>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Crear Pedido</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Formulario de nuevo pedido próximamente.</p>
        </CardContent>
      </Card>
    </div>
  );
}
