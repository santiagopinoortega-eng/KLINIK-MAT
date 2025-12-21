import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { canAccessNewCase, getUserUsageStats } from '@/lib/subscription';

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verificar acceso a nuevos casos
    const accessInfo = await canAccessNewCase(userId);
    
    // Obtener estadísticas de uso
    const usageStats = await getUserUsageStats(userId);

    return NextResponse.json({
      success: true,
      canAccess: accessInfo.canAccess,
      ...usageStats,
    });
  } catch (error: any) {
    console.error('❌ [CHECK-ACCESS] Error:', error);
    return NextResponse.json(
      { error: 'Error checking access' },
      { status: 500 }
    );
  }
}
