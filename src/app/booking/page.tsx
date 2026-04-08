// @ts-nocheck
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export default async function BookingPage() {
  const supabase = await createClient();
  
  // Debug: verificar conexão
  console.log('Fetching services...');
  
  const { data: services, error: servicesError } = await supabase
    .from('services')
    .select('*')
    .eq('is_active', true)
    .order('name');

  console.log('Services:', services, 'Error:', servicesError);

  const { data: barbers, error: barbersError } = await supabase
    .from('barbers')
    .select('*')
    .eq('is_active', true)
    .order('display_order');

  console.log('Barbers:', barbers, 'Error:', barbersError);

  // Fallback se não houver dados
  const fallbackServices = services?.length === 0 ? [
    { id: '1', name: 'Corte Masculino', description: 'Corte tradicional', duration_minutes: 30, price: 45 },
    { id: '2', name: 'Barba', description: 'Modelagem de barba', duration_minutes: 20, price: 30 },
    { id: '3', name: 'Corte + Barba', description: 'Combo completo', duration_minutes: 50, price: 70 },
  ] : services;

  const fallbackBarbers = barbers?.length === 0 ? [
    { id: '1', name: 'Freitas', specialty: 'Corte clássico' },
    { id: '2', name: 'Lucas', specialty: 'Barba e degradê' },
  ] : barbers;

  const { default: BookingForm } = await import('./booking-form');

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b py-4">
        <div className="container mx-auto px-4">
          <h1 className="text-xl font-bold">Agendar Serviço</h1>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-6">
        <BookingForm 
          services={fallbackServices || []} 
          barbers={fallbackBarbers || []} 
        />
      </main>
    </div>
  );
}