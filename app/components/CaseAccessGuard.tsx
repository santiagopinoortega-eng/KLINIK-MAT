'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import LimitReachedModal from './LimitReachedModal';

interface CaseAccessGuardProps {
  children: React.ReactNode;
  caseId: string;
}

interface AccessInfo {
  canAccess: boolean;
  casesUsed: number;
  caseLimit: number | null;
  remaining: number | null;
}

export default function CaseAccessGuard({ children, caseId }: CaseAccessGuardProps) {
  const [accessInfo, setAccessInfo] = useState<AccessInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const router = useRouter();

  useEffect(() => {
    async function checkAccess() {
      try {
        const response = await fetch('/api/subscription/check-access');
        const data = await response.json();
        
        if (data.success) {
          setAccessInfo({
            canAccess: data.canAccess,
            casesUsed: data.casesUsed,
            caseLimit: data.caseLimit,
            remaining: data.remaining,
          });

          // Si no puede acceder, mostrar modal
          if (!data.canAccess) {
            setShowModal(true);
          }
        }
      } catch (error) {
        console.error('Error checking access:', error);
        // En caso de error, permitir acceso (fail open para mejor UX)
        setAccessInfo({
          canAccess: true,
          casesUsed: 0,
          caseLimit: null,
          remaining: null,
        });
      } finally {
        setLoading(false);
      }
    }

    checkAccess();
  }, [caseId]);

  const handleCloseModal = () => {
    setShowModal(false);
    router.push('/casos');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-lg text-neutral-500 animate-pulse">
          Verificando acceso...
        </div>
      </div>
    );
  }

  if (showModal && accessInfo && !accessInfo.canAccess && accessInfo.caseLimit) {
    return (
      <LimitReachedModal
        casesUsed={accessInfo.casesUsed}
        caseLimit={accessInfo.caseLimit}
        onClose={handleCloseModal}
      />
    );
  }

  return <>{children}</>;
}
