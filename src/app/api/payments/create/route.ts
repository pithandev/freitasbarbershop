import { NextRequest, NextResponse } from 'next/server';
import { createPaymentPreference } from '@/lib/mercadopago';

export async function POST(request: NextRequest) {
  try {
    const { appointmentId } = await request.json();

    if (!appointmentId) {
      return NextResponse.json(
        { error: 'Appointment ID is required' },
        { status: 400 }
      );
    }

    const preference = await createPaymentPreference(appointmentId);

    return NextResponse.json({
      preferenceId: preference.id,
      initPoint: preference.init_point,
    });
  } catch (error: unknown) {
    console.error('Error creating payment preference:', error);
    const message = error instanceof Error ? error.message : 'Failed to create payment preference';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}