'use client';

import { Scissors } from 'lucide-react';

export default function Loading() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="animate-spin">
          <Scissors className="h-8 w-8" />
        </div>
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    </div>
  );
}