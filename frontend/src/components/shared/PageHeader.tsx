import { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface ActionButton {
  label: string;
  href?: string;
  onClick?: () => void;
  icon?: ReactNode;
  variant?: 'default' | 'outline' | 'secondary' | 'destructive' | 'ghost' | 'link';
}

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: ActionButton[];
}

export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold">{title}</h1>
        {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
      </div>
      {actions && actions.length > 0 && (
        <div className="flex gap-2">
          {actions.map((action, index) =>
            action.href ? (
              <Button key={index} variant={action.variant || 'default'} asChild>
                <Link href={action.href}>
                  {action.icon && <span className="mr-2">{action.icon}</span>}
                  {action.label}
                </Link>
              </Button>
            ) : (
              <Button
                key={index}
                variant={action.variant || 'default'}
                onClick={action.onClick}
              >
                {action.icon && <span className="mr-2">{action.icon}</span>}
                {action.label}
              </Button>
            )
          )}
        </div>
      )}
    </div>
  );
}
