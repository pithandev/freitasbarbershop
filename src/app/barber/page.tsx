import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Appointment } from '@/types/database';
import DashboardBarber from './dashboard-barber';

async function getTodayAppointments() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) redirect('/login');

  const { data: barber } = await supabase
    .from('barbers')
    .select('id')
    .eq('user_id', user.id)
    .single();

  if (!barber) redirect('/');

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const { data: appointments } = await supabase
    .from('appointments')
    .select(`
      *,
      client:profiles!appointments_client_id_fkey(*),
      service:services(*),
      barber:barbers(*)
    `)
    .eq('barber_id', barber.id)
    .gte('scheduled_at', today.toISOString())
    .lt('scheduled_at', tomorrow.toISOString())
    .order('scheduled_at');

  return appointments as Appointment[] || [];
}

export default async function BarberDashboardPage() {
  const appointments = await getTodayAppointments();

  return <DashboardBarber appointments={appointments} />;
}