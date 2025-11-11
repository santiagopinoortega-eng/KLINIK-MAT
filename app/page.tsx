// app/page.tsx
import Link from 'next/link';
import Image from 'next/image';

export default function HomePage() {
  return (
    <main className="container-app py-12">
      <section className="hero text-center">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          
          <div className="card aspect-[4/3] grid place-items-center p-4 md:p-8">
            <Image
              src="/brand/logo-centro.png"
              alt="Logo de KLINIK-MAT"
              width={400}
              height={224}
              className="w-full max-w-sm h-auto"
              priority
            />
          </div>
          
          <div className="text-left">
            <h1 className="text-4xl lg:text-5xl font-extrabold mb-4 leading-tight 
                       bg-gradient-to-r from-brand-700 to-brand-900 bg-clip-text text-transparent">
              Bienvenido a KLINIK-MAT
            </h1>
            
            {/* --- ¡CAMBIO AQUÍ! --- 
              Cambiamos a un gris más suave para el párrafo
            */}
            <p className="text-lg text-neutral-600 mb-8">
              Plataforma de simulación clínica interactiva para estudiantes de obstetricia.
              Entrena tu razonamiento y toma decisiones en escenarios de <b>Anticoncepción</b>, <b>ITS</b> y <b>Consejería</b>.
            </p>
            
            <Link href="/casos" className="btn btn-primary btn-lg"> 
              Empezar a aprender → 
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
