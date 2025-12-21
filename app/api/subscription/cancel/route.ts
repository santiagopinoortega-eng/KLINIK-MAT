import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { subscriptionId, reason } = body;

    if (!subscriptionId) {
      return NextResponse.json(
        { error: 'Subscription ID is required' },
        { status: 400 }
      );
    }

    // Verificar que la suscripción pertenece al usuario
    const subscription = await prisma.subscription.findFirst({
      where: {
        id: subscriptionId,
        userId: userId,
        status: 'ACTIVE',
      },
    });

    if (!subscription) {
      return NextResponse.json(
        { error: 'Subscription not found or already cancelled' },
        { status: 404 }
      );
    }

    // Marcar para cancelar al final del período
    const updatedSubscription = await prisma.subscription.update({
      where: { id: subscriptionId },
      data: {
        cancelAtPeriodEnd: true,
        canceledAt: new Date(),
        cancelReason: reason || null,
      },
    });

    console.log('✅ [CANCEL-SUBSCRIPTION] Marked for cancellation:', {
      subscriptionId,
      userId,
      endDate: updatedSubscription.currentPeriodEnd,
    });

    return NextResponse.json({
      success: true,
      message: 'Subscription will be cancelled at the end of the billing period',
      subscription: {
        id: updatedSubscription.id,
        cancelAtPeriodEnd: updatedSubscription.cancelAtPeriodEnd,
        currentPeriodEnd: updatedSubscription.currentPeriodEnd,
      },
    });
  } catch (error: any) {
    console.error('❌ [CANCEL-SUBSCRIPTION] Error:', error);
    return NextResponse.json(
      { error: 'Error cancelling subscription' },
      { status: 500 }
    );
  }
}

// Endpoint para reactivar suscripción cancelada
export async function DELETE(req: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const subscriptionId = searchParams.get('subscription_id');

    if (!subscriptionId) {
      return NextResponse.json(
        { error: 'Subscription ID is required' },
        { status: 400 }
      );
    }

    // Verificar que la suscripción pertenece al usuario
    const subscription = await prisma.subscription.findFirst({
      where: {
        id: subscriptionId,
        userId: userId,
        cancelAtPeriodEnd: true,
      },
    });

    if (!subscription) {
      return NextResponse.json(
        { error: 'Subscription not found or not marked for cancellation' },
        { status: 404 }
      );
    }

    // Reactivar suscripción
    const updatedSubscription = await prisma.subscription.update({
      where: { id: subscriptionId },
      data: {
        cancelAtPeriodEnd: false,
        canceledAt: null,
        cancelReason: null,
      },
    });

    console.log('✅ [REACTIVATE-SUBSCRIPTION] Reactivated:', {
      subscriptionId,
      userId,
    });

    return NextResponse.json({
      success: true,
      message: 'Subscription reactivated successfully',
      subscription: {
        id: updatedSubscription.id,
        cancelAtPeriodEnd: updatedSubscription.cancelAtPeriodEnd,
      },
    });
  } catch (error: any) {
    console.error('❌ [REACTIVATE-SUBSCRIPTION] Error:', error);
    return NextResponse.json(
      { error: 'Error reactivating subscription' },
      { status: 500 }
    );
  }
}
