// @ts-nocheck
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Appointment } from '@/types/database';
import ProfileView from './profile-view';

export const dynamic = 'force-dynamic';

async function getProfileData() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) redirect('/login');

  const [profileResult, appointmentsResult] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase
      .from('appointments')
      .select(`
        *,
        service:services(*),
        barber:barbers(*)
      `)
      .eq('client_id', user.id)
      .order('scheduled_at', { ascending: false })
  ]);

  const profile = profileResult.data;
  const appointments = appointmentsResult.data as Appointment[] || [];

  const upcoming = appointments.filter(a => 
    new Date(a.scheduled_at) >= new Date() && 
    a.status !== 'cancelled'
  );
  
  const past = appointments.filter(a => 
    new Date(a.scheduled_at) < new Date() || 
    a.status === 'cancelled'
  );

  return { profile, upcoming, past };
}

export default async function ProfilePage() {
  const { profile, upcoming, past } = await getProfileData();

  return <ProfileView profile={profile} upcoming={upcoming} past={past} />;
}