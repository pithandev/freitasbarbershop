'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  const handleGoBack = () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      window.location.href = '/';
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="text-center space-y-6">
        <h1 className="text-8xl font-bold">404</h1>
        <h2 className="text-2xl font-semibold">Página não encontrada</h2>
        <p className="text-muted-foreground max-w-md">
          A página que você está procurando não existe ou foi movida.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/">
            <Button>
              <Home className="mr-2 h-4 w-4" />
              Voltar ao Início
            </Button>
          </Link>
          <Button variant="outline" onClick={handleGoBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Página Anterior
          </Button>
        </div>
      </div>
    </div>
  );
}