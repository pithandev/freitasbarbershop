'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { CheckCircle, Calendar, Clock, ArrowLeft } from 'lucide-react';

function BookingSuccessContent() {
  const searchParams = useSearchParams();
  const appointmentId = searchParams.get('appointment');

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="w-16 h-16 mx-auto rounded-full bg-green-100 flex items-center justify-center">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
        
        <h1 className="text-2xl font-bold">Agendamento Confirmado!</h1>
        
        <p className="text-muted-foreground">
          Seu agendamento foi criado com sucesso. Você receberá uma confirmação via WhatsApp.
        </p>

        <div className="bg-muted p-4 rounded-lg space-y-3 text-left">
          <div className="flex items-center gap-3 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>Confirme seu horário na recepção</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>Chegue 5 minutos antes</span>
          </div>
        </div>

        <div className="space-y-3">
          <Link href="/">
            <Button className="w-full">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar ao Início
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function BookingSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Carregando...</div>}>
      <BookingSuccessContent />
    </Suspense>
  );
}