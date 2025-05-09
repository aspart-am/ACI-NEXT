import { LoginForm } from '@/app/components/auth/LoginForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/40">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">Connexion</CardTitle>
          <CardDescription>
            Entrez vos identifiants pour accéder à l'application ACI-MSP
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm />
          <div className="mt-4 text-center text-sm">
            Vous n'avez pas de compte?{' '}
            <Link href="/auth/contact" className="text-primary hover:underline">
              Contactez l'administrateur
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 