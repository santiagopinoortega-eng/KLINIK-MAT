// app/sign-up/[[...sign-up]]/page.tsx
'use client';

import { Suspense } from 'react';
import { SignUp } from '@clerk/nextjs';
import { useSearchParams } from 'next/navigation';

function SignUpContent() {
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect_url') || '/areas';
  
  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-8">KLINIK-MAT</h1>
        <SignUp 
          fallbackRedirectUrl={redirectUrl}
          signInUrl="/sign-in"
          appearance={{
            elements: {
              rootBox: "mx-auto w-full",
              card: "shadow-xl rounded-xl w-full",
            }
          }}
        />
      </div>
    </div>
  );
}

export default function SignUpPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
      </div>
    }>
      <SignUpContent />
    </Suspense>
  );
}
