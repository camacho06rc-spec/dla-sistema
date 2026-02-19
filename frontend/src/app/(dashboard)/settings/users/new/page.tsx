'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { settingsApi } from '@/lib/api/settings';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/shared/PageHeader';

const schema = z.object({
  firstName: z.string().min(1, 'Nombre requerido'),
  lastName: z.string().min(1, 'Apellido requerido'),
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'Contraseña mínimo 8 caracteres'),
  roleId: z.string().min(1, 'Rol requerido'),
  branchId: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function NewUserPage() {
  const router = useRouter();
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const mutation = useMutation({
    mutationFn: settingsApi.createUser,
    onSuccess: () => router.push('/settings/users'),
  });

  const onSubmit = (data: FormData) => mutation.mutate(data);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Nuevo Usuario"
        actions={[{ label: 'Volver', href: '/settings/users', variant: 'outline' }]}
      />

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Datos del Usuario</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nombre</Label>
                <Input {...register('firstName')} placeholder="Nombre" />
                {errors.firstName && <p className="text-sm text-red-500">{errors.firstName.message}</p>}
              </div>
              <div className="space-y-2">
                <Label>Apellido</Label>
                <Input {...register('lastName')} placeholder="Apellido" />
                {errors.lastName && <p className="text-sm text-red-500">{errors.lastName.message}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" {...register('email')} placeholder="correo@empresa.com" />
              {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
            </div>

            <div className="space-y-2">
              <Label>Contraseña</Label>
              <Input type="password" {...register('password')} placeholder="••••••••" />
              {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>ID de Rol</Label>
                <Input {...register('roleId')} placeholder="UUID del rol" />
                {errors.roleId && <p className="text-sm text-red-500">{errors.roleId.message}</p>}
              </div>
              <div className="space-y-2">
                <Label>ID de Sucursal (opcional)</Label>
                <Input {...register('branchId')} placeholder="UUID de la sucursal" />
              </div>
            </div>

            {mutation.isError && (
              <p className="text-sm text-red-500">Error al crear el usuario</p>
            )}

            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? 'Creando...' : 'Crear Usuario'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
