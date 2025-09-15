'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { ThemeToggle } from './theme-toggle';

export function Navbar() {
  const pathname = usePathname();

  const routes = [
    { href: '/products', label: 'Products' },
    { href: '/adjust-transactions', label: 'Transactions' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 h-14 flex items-center">
        <nav className="flex items-center space-x-4 lg:space-x-6 justify-between w-full">
          <div className="flex items-center space-x-4 lg:space-x-6">
            {routes.map((route) => (
              <Link
                key={route.href}
                href={route.href}
                className={cn(
                  'text-sm font-medium transition-colors hover:text-primary',
                  pathname === route.href
                    ? 'text-primary'
                    : 'text-muted-foreground',
                )}
              >
                {route.label}
              </Link>
            ))}
          </div>
          <div className="flex items-center space-x-4">
            <ThemeToggle />
          </div>
        </nav>
      </div>
    </header>
  );
}
