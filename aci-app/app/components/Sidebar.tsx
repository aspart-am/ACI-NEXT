'use client';

import Link from 'next/link';
import { MoveRight, Home, Users, CalendarClock, BarChart4, Settings, FileCode2, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarProps {
  className?: string;
  isCollapsed?: boolean;
  onToggle?: () => void;
}

export function Sidebar({ className, isCollapsed = false, onToggle }: SidebarProps) {
  const links = [
    { href: '/dashboard', icon: Home, label: 'Tableau de bord' },
    { href: '/dashboard/revenus', icon: BarChart4, label: 'Revenus' },
    { href: '/dashboard/associes', icon: Users, label: 'Associés' },
    { href: '/dashboard/reunions', icon: CalendarClock, label: 'Réunions' },
    { href: '/dashboard/projets', icon: FileCode2, label: 'Projets' },
    { href: '/dashboard/repartition', icon: BarChart4, label: 'Répartition' },
    { href: '/dashboard/parametres', icon: Settings, label: 'Paramètres' },
  ];

  return (
    <aside className={cn(
      "flex flex-col border-r bg-sidebar text-sidebar-foreground transition-all duration-300",
      isCollapsed ? "w-[80px]" : "w-[250px]",
      className
    )}>
      <div className="flex h-16 items-center border-b border-sidebar-border px-4">
        <div className="flex items-center gap-2">
          {isCollapsed ? (
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-white">
              <span className="font-bold">ACI</span>
            </div>
          ) : (
            <div className="text-xl font-bold">ACI Santé</div>
          )}
        </div>
        {!isCollapsed && <button 
          className="ml-auto text-white hover:text-secondary-foreground"
          onClick={onToggle}
        >
          <MoveRight size={20} />
        </button>}
      </div>
      
      <nav className="flex-1 p-2">
        <ul className="space-y-1">
          {links.map((link) => (
            <li key={link.href}>
              <Link 
                href={link.href}
                className={cn(
                  "flex items-center gap-3 rounded-md p-2 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors",
                  isCollapsed && "justify-center"
                )}
              >
                <link.icon size={isCollapsed ? 24 : 20} className="text-sidebar-primary" />
                {!isCollapsed && <span>{link.label}</span>}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      
      <div className="border-t border-sidebar-border p-2">
        <Link 
          href="/auth/logout"
          className={cn(
            "flex items-center gap-3 rounded-md p-2 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors",
            isCollapsed && "justify-center"
          )}
        >
          <LogOut size={isCollapsed ? 24 : 20} className="text-sidebar-primary" />
          {!isCollapsed && <span>Déconnexion</span>}
        </Link>
      </div>
    </aside>
  );
} 