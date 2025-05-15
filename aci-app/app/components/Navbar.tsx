import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="border-b border-border bg-background">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="text-xl font-bold">
            ACI-MSP
          </Link>
          <div className="hidden md:flex gap-4">
            <Link href="/dashboard/revenus" className="text-sm hover:text-primary transition">
              Revenus
            </Link>
            <Link href="/dashboard/associes" className="text-sm hover:text-primary transition">
              Associés
            </Link>
            <Link href="/dashboard/reunions" className="text-sm hover:text-primary transition">
              Réunions
            </Link>
            <Link href="/dashboard/projets" className="text-sm hover:text-primary transition">
              Projets
            </Link>
            <Link href="/dashboard/repartition" className="text-sm hover:text-primary transition">
              Répartition
            </Link>
            <Link href="/dashboard/parametres" className="text-sm hover:text-primary transition">
              Paramètres
            </Link>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/auth/logout">Déconnexion</Link>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </div>
      
      {/* Menu mobile */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-border bg-background">
          <div className="container py-4 flex flex-col gap-4">
            <Link href="/dashboard/revenus" className="text-sm hover:text-primary transition">
              Revenus
            </Link>
            <Link href="/dashboard/associes" className="text-sm hover:text-primary transition">
              Associés
            </Link>
            <Link href="/dashboard/reunions" className="text-sm hover:text-primary transition">
              Réunions
            </Link>
            <Link href="/dashboard/projets" className="text-sm hover:text-primary transition">
              Projets
            </Link>
            <Link href="/dashboard/repartition" className="text-sm hover:text-primary transition">
              Répartition
            </Link>
            <Link href="/dashboard/parametres" className="text-sm hover:text-primary transition">
              Paramètres
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
} 