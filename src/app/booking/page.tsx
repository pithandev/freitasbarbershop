// @ts-nocheck
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export default async function BookingPage() {
  const supabase = await createClient();
  
  // Dados fallback
  const fallbackServices = [
    { id: '1', name: 'Corte Masculino', description: 'Corte tradicional com máquinas e tesoura', duration_minutes: 30, price: 45.00, category: 'haircut' },
    { id: '2', name: 'Barba', description: 'Modelagem e acabamento de barba', duration_minutes: 20, price: 30.00, category: 'beard' },
    { id: '3', name: 'Corte + Barba', description: 'Corte masculino completo com barba', duration_minutes: 50, price: 70.00, category: 'combo' },
    { id: '4', name: 'Pezinho', description: 'Aparar os lados e nuca', duration_minutes: 15, price: 20.00, category: 'maintenance' },
    { id: '5', name: 'Acabamento', description: 'Sombrancelha e bigode', duration_minutes: 10, price: 15.00, category: 'maintenance' },
    { id: '6', name: 'Tratamento Capilar', description: 'Hidratação ou maturação', duration_minutes: 40, price: 55.00, category: 'treatment' },
  ];

  const fallbackBarbers = [
    { id: '1', name: 'Freitas', specialty: 'Corte clássico', bio: '20 anos de experiência', display_order: 1 },
    { id: '2', name: 'Lucas', specialty: 'Barba e degradê', bio: 'Especialista em barba', display_order: 2 },
    { id: '3', name: 'Matheus', specialty: 'Corte moderno', bio: 'Apaixonado por tendências', display_order: 3 },
  ];

  // Tentar buscar do banco
  let services = fallbackServices;
  let barbers = fallbackBarbers;

  try {
    const { data: servicesData } = await supabase
      .from('services')
      .select('*')
      .eq('is_active', true)
      .order('name');
    
    if (servicesData && servicesData.length > 0) {
      services = servicesData;
    }

    const { data: barbersData } = await supabase
      .from('barbers')
      .select('*')
      .eq('is_active', true)
      .order('display_order');
    
    if (barbersData && barbersData.length > 0) {
      barbers = barbersData;
    }
  } catch (e) {
    console.error('DB error:', e);
  }

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
          services={services} 
          barbers={barbers} 
        />
      </main>
    </div>
  );
}