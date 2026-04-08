// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const topic = request.headers.get('x-topic') || request.headers.get('x-event-type');
    
    if (topic === 'payment') {
      const paymentData = JSON.parse(body);
      const paymentId = paymentData.id?.toString();
      const status = paymentData.status;
      const externalReference = paymentData.external_reference;

      if (!externalReference) {
        console.error('No external reference found');
        return NextResponse.json({ received: true });
      }

      const supabase = await createClient();

      let paymentStatus: 'pending' | 'paid' | 'refunded' | 'failed' = 'pending';
      let appointmentStatus: 'pending' | 'confirmed' | 'cancelled' = 'pending';

      switch (status) {
        case 'approved':
          paymentStatus = 'paid';
          appointmentStatus = 'confirmed';
          break;
        case 'rejected':
        case 'cancelled':
          paymentStatus = 'failed';
          appointmentStatus = 'cancelled';
          break;
        case 'refunded':
          paymentStatus = 'refunded';
          break;
        case 'in_process':
        case 'pending':
        default:
          paymentStatus = 'pending';
          break;
      }

      await supabase
        .from('appointments')
        .update({
          payment_status: paymentStatus,
          payment_id: paymentId,
          status: appointmentStatus,
          updated_at: new Date().toISOString(),
        })
        .eq('id', externalReference);

      console.log(`Payment ${paymentId} updated: ${paymentStatus}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}