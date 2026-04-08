'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="text-center space-y-6 max-w-md">
        <div className="w-16 h-16 mx-auto rounded-full bg-destructive/10 flex items-center justify-center">
          <AlertTriangle className="h-8 w-8 text-destructive" />
        </div>
        <h1 className="text-2xl font-semibold">Algo deu errado</h1>
        <p className="text-muted-foreground">
          Ocorreu um erro inesperado. Por favor, tente novamente.
        </p>
        {error.digest && (
          <p className="text-xs text-muted-foreground">
            ID do erro: {error.digest}
          </p>
        )}
        <div className="flex gap-3 justify-center">
          <Button onClick={reset}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Tentar Novamente
          </Button>
          <Link href="/">
            <Button variant="outline">
              Voltar ao Início
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}