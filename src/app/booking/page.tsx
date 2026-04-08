import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export default async function BookingPage() {
  const supabase = await createClient();
  
  const { data: services } = await supabase
    .from('services')
    .select('*')
    .eq('is_active', true)
    .order('name');

  const { data: barbers } = await supabase
    .from('barbers')
    .select('*')
    .eq('is_active', true)
    .order('display_order');

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
          services={services || []} 
          barbers={barbers || []} 
        />
      </main>
    </div>
  );
}