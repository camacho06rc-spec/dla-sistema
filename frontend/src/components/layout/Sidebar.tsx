'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Users, 
  Truck,
  CreditCard,
  BarChart3,
  Gift,
  Star,
  Settings
} from 'lucide-react';
import { cn } from '@/lib/utils';

const menuItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/products', label: 'Productos', icon: Package },
  { href: '/orders', label: 'Pedidos', icon: ShoppingCart },
  { href: '/customers', label: 'Clientes', icon: Users },
  { href: '/deliveries', label: 'Entregas', icon: Truck },
  { href: '/payments', label: 'Cobranza', icon: CreditCard },
  { href: '/reports', label: 'Reportes', icon: BarChart3 },
  { href: '/promotions', label: 'Promociones', icon: Gift },
  { href: '/loyalty', label: 'Lealtad', icon: Star },
  { href: '/settings', label: 'Configuración', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r bg-white">
      <div className="flex h-16 items-center border-b px-6">
        <h1 className="text-xl font-bold text-primary">Sistema DLA</h1>
      </div>
      <nav className="space-y-1 p-4">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              )}
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
