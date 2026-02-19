'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PageHeader } from '@/components/shared/PageHeader';
import { Users, Shield, Key } from 'lucide-react';

export default function SettingsPage() {
  const sections = [
    {
      title: 'Usuarios',
      description: 'Gestión de usuarios del sistema',
      href: '/settings/users',
      icon: Users,
    },
    {
      title: 'Roles',
      description: 'Configuración de roles y permisos',
      href: '/settings/roles',
      icon: Shield,
    },
    {
      title: 'Permisos',
      description: 'Lista de permisos disponibles',
      href: '/settings/permissions',
      icon: Key,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Configuración" description="Administración del sistema" />

      <div className="grid gap-4 md:grid-cols-3">
        {sections.map((section) => {
          const Icon = section.icon;
          return (
            <Card key={section.href} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon className="h-5 w-5" />
                  {section.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">{section.description}</p>
                <Button asChild variant="outline" className="w-full">
                  <Link href={section.href}>Ir a {section.title}</Link>
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
