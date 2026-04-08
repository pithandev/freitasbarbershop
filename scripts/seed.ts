import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
  console.log('🌱 Starting seed...');

  // Services
  const services = [
    { name: 'Corte Masculino', description: 'Corte tradicional com máquinas e tesoura', duration_minutes: 30, price: 45.00, category: 'haircut' },
    { name: 'Barba', description: 'Modelagem e acabamento de barba', duration_minutes: 20, price: 30.00, category: 'beard' },
    { name: 'Corte + Barba', description: 'Corte masculino completo com barba', duration_minutes: 50, price: 70.00, category: 'combo' },
    { name: 'Pezinho', description: 'Aparar os lados e nuca', duration_minutes: 15, price: 20.00, category: 'maintenance' },
    { name: 'Acabamento', description: 'Sombrancelha e bigode', duration_minutes: 10, price: 15.00, category: 'maintenance' },
    { name: 'Tratamento Capilar', description: 'Hidratação ou maturação', duration_minutes: 40, price: 55.00, category: 'treatment' },
  ];

  const { data: servicesData, error: servicesError } = await supabase
    .from('services')
    .upsert(services, { onConflict: 'name' })
    .select();

  if (servicesError) {
    console.error('Error inserting services:', servicesError);
  } else {
    console.log('✅ Services seeded');
  }

  // Barbers
  const barbers = [
    { name: 'Freitas', specialty: 'Corte clássico', bio: '20 anos de experiência', display_order: 1 },
    { name: 'Lucas', specialty: 'Barba e degradê', bio: 'Especialista em barba', display_order: 2 },
    { name: 'Matheus', specialty: 'Corte moderno', bio: 'Apaixonado por tendências', display_order: 3 },
  ];

  const { data: barbersData, error: barbersError } = await supabase
    .from('barbers')
    .upsert(barbers, { onConflict: 'name' })
    .select();

  if (barbersError) {
    console.error('Error inserting barbers:', barbersError);
  } else {
    console.log('✅ Barbers seeded');
  }

  // Availability (default schedule)
  const { data: barbersList } = await supabase.from('barbers').select('id');
  
  if (barbersList && barbersList.length > 0) {
    const availability = [];
    for (const barber of barbersList) {
      // Monday to Saturday (1-6)
      for (const day of [1, 2, 3, 4, 5, 6]) {
        availability.push({
          barber_id: barber.id,
          day_of_week: day,
          start_time: '09:00',
          end_time: day === 6 ? '18:00' : '19:00',
          is_available: true,
        });
      }
    }

    const { error: availError } = await supabase.from('availability').upsert(availability);
    if (availError) {
      console.error('Error inserting availability:', availError);
    } else {
      console.log('✅ Availability seeded');
    }
  }

  console.log('🎉 Seed complete!');
}

seed().catch(console.error);