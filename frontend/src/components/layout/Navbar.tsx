'use client';

import { useAuthStore } from '@/lib/store/authStore';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { LogOut, User } from 'lucide-react';

export function Navbar() {
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <header className="fixed left-64 right-0 top-0 z-30 h-16 border-b bg-white">
      <div className="flex h-full items-center justify-between px-6">
        <h2 className="text-lg font-semibold">Bienvenido, {user?.firstName}</h2>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm">
            <User className="h-4 w-4" />
            <span>{user?.email}</span>
          </div>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Salir
          </Button>
        </div>
      </div>
    </header>
  );
}
