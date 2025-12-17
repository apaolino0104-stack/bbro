// src/app/proprietari/[id]/page.js
import prisma from '@/lib/db';
import Link from 'next/link';
import { aggiornaProprietario, uploadDocumento, eliminaDocumento } from '@/app/actions';
import { createClient } from '@supabase/supabase-js';
import Image from 'next/image';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function DettaglioProprietario({ params }) {
  // Await params per Next.js 15
  const { id: idParam } = await params;
  const id = parseInt(idParam);

  const p = await prisma.proprietario.findUnique({
    where: { id: id },
    include: {
      immobili: true,
      documenti: true
    }
  });

  if (!p) return <div>Proprietario non trovato</div>;

  // Genera Signed URL per ogni documento (valido 1 ora)
  const documentiConUrl = await Promise.all(p.documenti.map(async (doc) => {
    const { data } = await supabase
      .storage
      .from('documenti')
      .createSignedUrl(doc.fileUrl, 3600); // 3600 secondi = 1 ora

    return {
      ...doc,
      signedUrl: data?.signedUrl || null
    };
  }));

  return (
    <main className="min-h-screen bg-bbro-background p-10">
      <Link href="/" className="text-bbro-element-light hover:text-bbro-element-dark text-sm font-bold tracking-wide mb-4 inline-block">← TORNA ALLA DASHBOARD</Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">

        {/* COLONNA SINISTRA: FORM */}
        <div className="bg-white p-8 rounded-sm shadow-sm border-t-4 border-bbro-element-dark">
          <h1 className="text-2xl font-bold mb-6 text-bbro-element-dark">Modifica Proprietario</h1>

          <form action={aggiornaProprietario} className="space-y-5">
            <input type="hidden" name="id" value={p.id} />

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-bbro-foreground uppercase tracking-wide mb-1">Nome</label>
                <input name="nome" defaultValue={p.nome} className="w-full p-2 border border-bbro-foreground/20 rounded-sm focus:border-bbro-element-light focus:outline-none text-bbro-element-dark" />
              </div>
              <div>
                <label className="block text-xs font-bold text-bbro-foreground uppercase tracking-wide mb-1">Cognome</label>
                <input name="cognome" defaultValue={p.cognome} className="w-full p-2 border border-bbro-foreground/20 rounded-sm focus:border-bbro-element-light focus:outline-none text-bbro-element-dark" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-bbro-foreground uppercase tracking-wide mb-1">Telefono</label>
              <input name="telefono" defaultValue={p.telefono || ''} className="w-full p-2 border border-bbro-foreground/20 rounded-sm focus:border-bbro-element-light focus:outline-none text-bbro-element-dark" />
            </div>

            <div>
              <label className="block text-xs font-bold text-bbro-foreground uppercase tracking-wide mb-1">Codice Fiscale</label>
              <input name="codiceFiscale" defaultValue={p.codiceFiscale || ''} className="w-full p-2 border border-bbro-foreground/20 rounded-sm focus:border-bbro-element-light focus:outline-none text-bbro-element-dark uppercase" maxLength={16} />
            </div>

            <div>
              <label className="block text-xs font-bold text-bbro-foreground uppercase tracking-wide mb-1">Email Personale</label>
              <input name="emailPersonale" defaultValue={p.emailPersonale || ''} className="w-full p-2 border border-bbro-foreground/20 rounded-sm focus:border-bbro-element-light focus:outline-none text-bbro-element-dark" />
            </div>

            {/* SEZIONE CREDENZIALI - EDITABILI - COLLAPSIBLE */}
            <details className="bg-bbro-background/30 p-4 rounded-sm border border-bbro-foreground/10 group">
              <summary className="font-bold text-bbro-element-light text-xs uppercase tracking-widest cursor-pointer list-none flex justify-between items-center select-none">
                <span>Credenziali Accesso (Clicca per espandere)</span>
                <span className="text-[10px] opacity-50 group-open:rotate-180 transition-transform">▼</span>
              </summary>

              <div className="space-y-4 mt-4 border-t border-bbro-foreground/10 pt-4">
                {/* Google */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-bbro-foreground uppercase tracking-wide mb-1">Google Email</label>
                    <input name="googleEmail" defaultValue={p.googleEmail || ''} className="w-full p-2 border border-bbro-foreground/20 rounded-sm focus:border-bbro-element-light focus:outline-none text-bbro-element-dark text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-bbro-foreground uppercase tracking-wide mb-1">Google Password</label>
                    <input name="googlePass" defaultValue={p.googlePass || ''} className="w-full p-2 border border-bbro-foreground/20 rounded-sm focus:border-bbro-element-light focus:outline-none text-bbro-element-dark text-sm" />
                  </div>
                </div>

                {/* Booking */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-bbro-foreground uppercase tracking-wide mb-1">Booking User</label>
                    <input name="bookingUser" defaultValue={p.bookingUser || ''} className="w-full p-2 border border-bbro-foreground/20 rounded-sm focus:border-bbro-element-light focus:outline-none text-bbro-element-dark text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-bbro-foreground uppercase tracking-wide mb-1">Booking Password</label>
                    <input name="bookingPass" defaultValue={p.bookingPass || ''} className="w-full p-2 border border-bbro-foreground/20 rounded-sm focus:border-bbro-element-light focus:outline-none text-bbro-element-dark text-sm" />
                  </div>
                </div>

                {/* Airbnb */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-bbro-foreground uppercase tracking-wide mb-1">Airbnb User</label>
                    <input name="airbnbUser" defaultValue={p.airbnbUser || ''} className="w-full p-2 border border-bbro-foreground/20 rounded-sm focus:border-bbro-element-light focus:outline-none text-bbro-element-dark text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-bbro-foreground uppercase tracking-wide mb-1">Airbnb Password</label>
                    <input name="airbnbPass" defaultValue={p.airbnbPass || ''} className="w-full p-2 border border-bbro-foreground/20 rounded-sm focus:border-bbro-element-light focus:outline-none text-bbro-element-dark text-sm" />
                  </div>
                </div>

                {/* CiaoBooking */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-bbro-foreground uppercase tracking-wide mb-1">CiaoBooking User</label>
                    <input name="ciaoBookingUser" defaultValue={p.ciaoBookingUser || ''} className="w-full p-2 border border-bbro-foreground/20 rounded-sm focus:border-bbro-element-light focus:outline-none text-bbro-element-dark text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-bbro-foreground uppercase tracking-wide mb-1">CiaoBooking Password</label>
                    <input name="ciaoBookingPass" defaultValue={p.ciaoBookingPass || ''} className="w-full p-2 border border-bbro-foreground/20 rounded-sm focus:border-bbro-element-light focus:outline-none text-bbro-element-dark text-sm" />
                  </div>
                </div>
              </div>
            </details>

            <button type="submit" className="bg-bbro-element-light text-white px-4 py-3 rounded-sm hover:bg-bbro-element-dark w-full font-bold uppercase tracking-widest text-xs transition mt-4">
              Salva Modifiche
            </button>
          </form>
        </div>

        {/* COLONNA DESTRA: LISTA IMMOBILI */}
        <div>
          <h2 className="text-2xl font-bold mb-6 text-bbro-element-dark">Immobili Associati</h2>
          <div className="space-y-4">
            {p.immobili.map((casa) => (
              <Link key={casa.id} href={`/immobili/${casa.id}`} className="block group">
                <div className="bg-white p-6 rounded-sm shadow-sm border-l-4 border-bbro-element-light group-hover:bg-bbro-element-dark group-hover:border-bbro-element-dark transition cursor-pointer">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-bold text-lg text-bbro-element-dark group-hover:text-white transition">🏠 {casa.nome || casa.indirizzo}</h3>
                      <p className="text-bbro-foreground text-sm group-hover:text-bbro-element-light transition">{casa.indirizzo} - {casa.zona}</p>
                      <div className="text-xs text-bbro-foreground/60 mt-2 flex gap-3 group-hover:text-white/70">
                        <span>📐 {casa.metriQuadri || '-'} mq</span>
                        <span>🛏️ {casa.postiLetto || '-'} Posti</span>
                      </div>
                    </div>
                    <span className="text-bbro-element-light font-bold opacity-0 group-hover:opacity-100 transition">→</span>
                  </div>
                </div>
              </Link>
            ))}

            <Link href={`/proprietari/${p.id}/aggiungi-immobile`} className="block w-full text-center py-4 border-2 border-dashed border-bbro-element-light/30 text-bbro-element-light hover:bg-bbro-element-light hover:text-white rounded-sm uppercase text-xs font-bold tracking-widest transition">
              + Aggiungi Immobile
            </Link>
          </div>
        </div>

        {/* COLONNA DESTRA (SOTTO): DOCUMENTI */}
        <div className="lg:col-span-2 mt-[-20px] mb-10">
          <div className="bg-white p-8 rounded-sm shadow-sm border-t-4 border-bbro-element-light">
            <h2 className="text-2xl font-bold mb-6 text-bbro-element-dark flex justify-between items-center">
              <span>🗂️ Documenti e File</span>
            </h2>

            {/* LISTA DOCUMENTI */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {documentiConUrl.map((doc) => (
                <div key={doc.id} className="relative group border border-gray-200 rounded-sm p-4 text-center hover:border-bbro-element-light transition">
                  <div className="h-24 flex items-center justify-center mb-2 bg-gray-50 rounded-sm overflow-hidden">
                    {doc.tipo === 'IMG' ? (
                      <Image
                        src={doc.signedUrl}
                        alt={doc.nome}
                        fill
                        className="object-cover opacity-80 group-hover:opacity-100 transition"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    ) : (
                      <span className="text-4xl text-gray-400">📄</span>
                    )}
                  </div>
                  <a href={doc.signedUrl} target="_blank" className="text-xs font-bold text-bbro-element-dark truncate block hover:underline" title={doc.nome}>
                    {doc.nome}
                  </a>

                  {/* FORM ELIMINAZIONE */}
                  <form action={eliminaDocumento} className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition">
                    <input type="hidden" name="id" value={doc.id} />
                    <input type="hidden" name="proprietarioId" value={p.id} />
                    <button type="submit" className="bg-red-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs hover:bg-red-700 font-bold">
                      X
                    </button>
                  </form>
                </div>
              ))}

              {documentiConUrl.length === 0 && (
                <div className="col-span-full text-center py-8 text-gray-400 italic text-sm">
                  Nessun documento caricato.
                </div>
              )}
            </div>

            {/* FORM UPLOAD */}
            <div className="bg-gray-50 p-4 rounded-sm border-dashed border-2 border-gray-300">
              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-3">Carica Nuovo Documento</h3>
              <form action={uploadDocumento} className="flex gap-4 items-center">
                <input type="hidden" name="proprietarioId" value={p.id} />
                <input name="file" type="file" required accept=".pdf,image/*" className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-sm file:border-0 file:text-xs file:font-semibold file:bg-bbro-element-light file:text-white hover:file:bg-bbro-element-dark cursor-pointer" />
                <button type="submit" className="bg-bbro-element-dark text-white px-4 py-2 rounded-sm text-xs font-bold uppercase tracking-widest hover:bg-black transition">
                  Carica
                </button>
              </form>
            </div>
          </div>
        </div>

      </div>
    </main>
  );
}