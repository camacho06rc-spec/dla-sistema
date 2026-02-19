'use client';

import { useQuery, useMutation } from '@tanstack/react-query';
import { settingsApi } from '@/lib/api/settings';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/shared/PageHeader';
import { use, useEffect } from 'react';

const schema = z.object({
  firstName: z.string().min(1, 'Nombre requerido'),
  lastName: z.string().min(1, 'Apellido requerido'),
  email: z.string().email('Email inválido'),
  roleId: z.string().min(1, 'Rol requerido'),
  branchId: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface Props {
  params: Promise<{ id: string }>;
}

export default function EditUserPage({ params }: Props) {
  const { id } = use(params);
  const router = useRouter();

  const { data } = useQuery({
    queryKey: ['admin-user', id],
    queryFn: () => settingsApi.getUser(id),
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    const user = data?.data;
    if (user) {
      reset({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        roleId: user.roleId || user.role?.id || '',
        branchId: user.branchId,
      });
    }
  }, [data, reset]);

  const mutation = useMutation({
    mutationFn: (formData: FormData) => settingsApi.updateUser(id, formData),
    onSuccess: () => router.push('/settings/users'),
  });

  const onSubmit = (data: FormData) => mutation.mutate(data);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Editar Usuario"
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
                <Input {...register('firstName')} />
                {errors.firstName && <p className="text-sm text-red-500">{errors.firstName.message}</p>}
              </div>
              <div className="space-y-2">
                <Label>Apellido</Label>
                <Input {...register('lastName')} />
                {errors.lastName && <p className="text-sm text-red-500">{errors.lastName.message}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" {...register('email')} />
              {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>ID de Rol</Label>
                <Input {...register('roleId')} />
                {errors.roleId && <p className="text-sm text-red-500">{errors.roleId.message}</p>}
              </div>
              <div className="space-y-2">
                <Label>ID de Sucursal (opcional)</Label>
                <Input {...register('branchId')} />
              </div>
            </div>

            {mutation.isError && <p className="text-sm text-red-500">Error al actualizar</p>}

            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
