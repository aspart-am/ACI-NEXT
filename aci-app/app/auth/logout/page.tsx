'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/app/lib/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    const handleLogout = async () => {
      await supabase.auth.signOut();
      router.push('/auth/login');
    };

    handleLogout();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/40">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">Déconnexion</CardTitle>
          <CardDescription>
            Vous êtes en train d'être déconnecté...
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p>Veuillez patienter, vous allez être redirigé.</p>
        </CardContent>
      </Card>
    </div>
  );
} 