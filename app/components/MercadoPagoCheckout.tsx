'use client';

import { useEffect, useState, useRef } from 'react';

interface MercadoPagoCheckoutProps {
  planId: string;
  planName: string;
  amount: number;
  onSuccess: (paymentId: string) => void;
  onError: (error: string) => void;
  onClose: () => void;
}

declare global {
  interface Window {
    MercadoPago: any;
  }
}

export default function MercadoPagoCheckout({
  planId,
  planName,
  amount,
  onSuccess,
  onError,
  onClose,
}: MercadoPagoCheckoutProps) {
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const initializationRef = useRef(false);
  const brickInstanceRef = useRef<any>(null);

  useEffect(() => {
    // Prevenir doble inicialización (React Strict Mode)
    if (initializationRef.current) return;
    initializationRef.current = true;

    // Cargar SDK de Mercado Pago
    const script = document.createElement('script');
    script.src = 'https://sdk.mercadopago.com/js/v2';
    script.async = true;
    script.onload = initializeMercadoPago;
    document.body.appendChild(script);

    return () => {
      // Cleanup: destruir brick si existe
      if (brickInstanceRef.current) {
        try {
          brickInstanceRef.current.unmount();
        } catch (e) {
          console.log('Error unmounting brick:', e);
        }
      }
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  const initializeMercadoPago = async () => {
    try {
      const publicKey = process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY;
      
      console.log('🔑 Public Key disponible:', publicKey ? 'SÍ' : 'NO');
      console.log('💰 Amount:', amount, 'Type:', typeof amount);
      
      if (!publicKey) {
        throw new Error('Missing NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY in environment');
      }

      const mp = new window.MercadoPago(publicKey, {
        locale: 'es-CL',
      });

      // Crear Card Payment Brick
      const bricksBuilder = mp.bricks();

      console.log('🧱 Creando Brick con amount:', amount);

      const brickInstance = await bricksBuilder.create('cardPayment', 'cardPaymentBrick_container', {
        initialization: {
          amount: Number(amount), // Asegurar que sea número
          payer: {
            email: 'test_user_3077235175@testuser.com', // Usuario comprador de prueba MP
          },
        },
        customization: {
          paymentMethods: {
            minInstallments: 1,
            maxInstallments: 1,
          },
          visual: {
            style: {
              theme: 'default',
            },
          },
        },
        callbacks: {
          onReady: () => {
            setLoading(false);
          },
          onSubmit: async (formData: any) => {
            setProcessing(true);
            try {
              const response = await fetch('/api/subscription/process-payment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  planId,
                  token: formData.token,
                  paymentMethodId: formData.payment_method_id,
                  issuerId: formData.issuer_id,
                  installments: formData.installments,
                }),
              });

              if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Error al procesar el pago');
              }

              const { paymentId } = await response.json();
              onSuccess(paymentId);
            } catch (error: any) {
              onError(error.message || 'Error al procesar el pago');
            } finally {
              setProcessing(false);
            }
          },
          onError: (error: any) => {
            console.error('❌ MP Brick error DETALLADO:', JSON.stringify(error, null, 2));
            onError('Error al cargar el formulario de pago');
          },
        },
      });

      // Guardar referencia para cleanup
      brickInstanceRef.current = brickInstance;
      console.log('✅ Brick creado exitosamente');
    } catch (error: any) {
      console.error('❌ Error initializing MP:', error);
      onError('Error al inicializar Mercado Pago');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-[#8B4513]">
                Finalizar Suscripción
              </h2>
              <p className="text-gray-600 mt-1">{planName}</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
              disabled={processing}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6">
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D2691E]"></div>
            </div>
          )}

          {processing && (
            <div className="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D2691E] mx-auto mb-4"></div>
                <p className="text-gray-700">Procesando pago...</p>
              </div>
            </div>
          )}

          <div id="cardPaymentBrick_container"></div>
        </div>

        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-between items-center text-sm text-gray-600">
            <span>Total a pagar:</span>
            <span className="text-2xl font-bold text-[#8B4513]">
              {new Intl.NumberFormat('es-CL', {
                style: 'currency',
                currency: 'CLP',
                minimumFractionDigits: 0,
              }).format(amount)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
