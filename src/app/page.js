// src/app/page.js
import prisma from '@/lib/db';
import Link from 'next/link';

export default async function Home() {
  const proprietari = await prisma.proprietario.findMany({
    include: { immobili: true },
    orderBy: { createdAt: 'desc' }
  });

  return (
    // SFONDO PANNA
    <main className="min-h-screen bg-bbro-background p-10">

      {/* INTESTAZIONE */}
      {/* INTESTAZIONE */}
      <div className="flex justify-between items-center mb-12 bg-bbro-element-dark p-6 rounded-sm shadow-md">
        <div>
          {/* TITOLO BIANCO */}
          <h1 className="text-4xl font-bold text-white tracking-tight">B&Brothers Rome</h1>
          {/* SOTTOTITOLO CHIARO */}
          <p className="text-white/80 mt-2 font-light">Pannello di gestione proprietà</p>
        </div>

        {/* BOTTONE ORO */}
        <Link
          href="/nuovo"
          className="bg-bbro-element-light text-white px-6 py-3 rounded-sm uppercase tracking-wider text-xs font-bold hover:bg-white hover:text-bbro-element-dark transition shadow-sm"
        >
          + Nuovo Proprietario
        </Link>
      </div>

      {/* LISTA PROPRIETARI */}
      {proprietari.length === 0 ? (
        <div className="text-center mt-20">
          <p className="text-xl text-bbro-element-dark font-medium">Nessun proprietario trovato.</p>
          <p className="mt-2 text-sm text-bbro-foreground">Clicca il tasto oro in alto per iniziare.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">

          {proprietari.map((p) => (
            <Link key={p.id} href={`/proprietari/${p.id}`} className="block group">

              <div className="bg-white rounded-sm shadow-sm border border-bbro-element-light/20 overflow-hidden group-hover:shadow-md group-hover:border-bbro-element-light transition cursor-pointer h-full flex flex-col">

                {/* Testata Card: SFONDO SCURO (#241d16) */}
                <div className="bg-bbro-element-dark p-4 border-b border-bbro-element-light/50 group-hover:bg-black transition">
                  <div className="flex justify-between items-center">
                    <div>
                      <h2 className="text-lg font-semibold text-white tracking-wide">{p.nome} {p.cognome}</h2>
                      <div className="mt-1">
                        {p.stato === 'TRATTATIVA' && <span className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wide">In Trattativa</span>}
                        {p.stato === 'DA_COMPLETARE' && <span className="bg-yellow-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wide">Da Completare</span>}
                        {p.stato === 'COMPLETO' && <span className="bg-green-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wide">Completo</span>}
                      </div>
                    </div>
                    {/* SCRITTA ORO */}
                    <span className="text-bbro-element-light opacity-0 group-hover:opacity-100 text-xs font-bold transition tracking-widest">APRI</span>
                  </div>
                </div>

                {/* Corpo */}
                <div className="p-5 flex-grow">
                  <h3 className="text-[10px] font-bold uppercase text-bbro-element-light tracking-widest mb-4">Proprietà</h3>

                  {p.immobili.length > 0 ? (
                    <div className="space-y-3">
                      {p.immobili.map((casa) => (
                        <div key={casa.id} className="flex items-start">
                          <span className="text-bbro-element-light mr-2 text-lg leading-none">•</span>
                          <div>
                            <p className="text-bbro-foreground font-bold text-sm leading-tight">{casa.indirizzo}</p>
                            <p className="text-xs text-bbro-foreground/70 mt-0.5">{casa.zona}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-bbro-foreground/50 italic">Nessun immobile associato.</p>
                  )}
                </div>

                {/* Footerino */}
                <div className="bg-bbro-background px-5 py-3 border-t border-bbro-element-light/10 flex justify-between items-center">
                  <span className="text-[10px] uppercase text-bbro-foreground/60 tracking-wider font-bold">ID: {p.id}</span>
                </div>

              </div>
            </Link>
          ))}

        </div>
      )}
    </main>
  );
}