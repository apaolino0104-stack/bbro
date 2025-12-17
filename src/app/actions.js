'use server'

import prisma from '@/lib/db';
import { redirect } from 'next/navigation';

export async function creaProprietario(formData) {
  const nome = formData.get('nome');
  const cognome = formData.get('cognome');

  // Dati Immobile
  // Dati Immobile
  const indirizzoRaw = formData.get('indirizzo');
  const zona = formData.get('zona'); // Prima era citta

  // Logica estrazione Civico
  let indirizzo = indirizzoRaw;
  let civico = null;
  // Regex: Cerca un numero (ev. con lettere/barre) alla fine della stringa
  // Es: "Via Roma 10", "Via Roma, 10A", "Piazza 5 Maggio 12/b"
  const civicoMatch = indirizzoRaw.match(/^(.*?)[,\s]+(\d+[a-zA-Z]?(?:\/[a-zA-Z0-9]+)?)$/);

  if (civicoMatch) {
    indirizzo = civicoMatch[1].trim(); // "Via Roma"
    civico = civicoMatch[2];           // "10"
  }

  // Logica Generazione Nome Immobile: "P" + PRIME 3 LETTERE (escluse Via, Viale...) in upper case
  const prefixToRemove = ["via", "viale", "largo", "vicolo", "piazza", "piazzale", "corso", "contrada", "salita", "discesa", "calle", "fondamenta", "strada"];
  let words = indirizzo.toLowerCase().split(/\s+/);

  // Remove prefix if matches known prefixes
  if (words.length > 0 && prefixToRemove.includes(words[0])) {
    words.shift();
  }

  // Find first "significant" word (skip "P.", "S.", single letters)
  let mainWord = words.length > 0 ? words[0] : "UNK";

  for (const w of words) {
    // Skip words ending with '.' (initials) or single letters
    if (w.includes('.') || w.length < 2) {
      continue;
    }
    mainWord = w;
    break;
  }

  // Extract first 3 chars
  const shortCode = mainWord.substring(0, 3).toUpperCase();
  const nomeGenerato = `P${shortCode}`;

  // Convertiamo i numeri (perché dal form arrivano come testo "100")
  // Se il campo è vuoto, salviamo null
  const mq = formData.get('metriQuadri') ? parseInt(formData.get('metriQuadri')) : null;
  const posti = formData.get('postiLetto') ? parseInt(formData.get('postiLetto')) : null;
  const postiExtra = formData.get('postiLettoExtra') ? parseInt(formData.get('postiLettoExtra')) : null;
  const camere = formData.get('camere') ? parseInt(formData.get('camere')) : null;
  const bagni = formData.get('bagni') ? parseInt(formData.get('bagni')) : null;

  // --- LOGICA GENERAZIONE ---
  const nomeClean = nome.toLowerCase().trim();
  const indirizzoNoSpazi = indirizzoRaw.replace(/\s+/g, ''); // Usa raw per univocità

  const passwordGenerata = `${indirizzoNoSpazi}!`;
  const usernameGenerato = `${nomeClean}.${indirizzoNoSpazi}`;
  const emailGoogleGenerata = `${nomeClean}.${indirizzoNoSpazi}@gmail.com`;

  // --- SALVATAGGIO ---
  await prisma.proprietario.create({
    data: {
      nome,
      cognome,
      codiceFiscale: formData.get('codiceFiscale'), // Nuovo campo
      googleEmail: emailGoogleGenerata,
      googlePass: passwordGenerata,
      bookingUser: usernameGenerato,
      bookingPass: passwordGenerata,
      airbnbUser: usernameGenerato,
      airbnbPass: passwordGenerata,
      ciaoBookingUser: usernameGenerato,
      ciaoBookingPass: passwordGenerata,

      immobili: {
        create: {
          nome: nomeGenerato,   // Nuovo generato
          indirizzo: indirizzo,
          civico: civico,       // Nuovo estratto
          zona: zona,           // Aggiornato
          // Dati Catastali & CIN (se presenti nel form creazione)
          CIN: formData.get('CIN'),
          foglio: formData.get('foglio'),
          particella: formData.get('particella'),
          subalterno: formData.get('subalterno'),
          metriQuadri: mq,      // Nuovo
          postiLetto: posti,    // Nuovo
          postiLettoExtra: postiExtra, // Nuovo
          camere: camere,       // Nuovo
          bagni: bagni          // Nuovo
        }
      }
    }
  });

  redirect('/');
}

// AZIONE: Modifica Proprietario
export async function aggiornaProprietario(formData) {
  const id = parseInt(formData.get('id')); // L'ID nascosto nel form

  await prisma.proprietario.update({
    where: { id: id },
    data: {
      nome: formData.get('nome'),
      cognome: formData.get('cognome'),
      codiceFiscale: formData.get('codiceFiscale'),
      telefono: formData.get('telefono'),
      emailPersonale: formData.get('emailPersonale'),
      stato: formData.get('stato'),

      // Credenziali
      googleEmail: formData.get('googleEmail'),
      googlePass: formData.get('googlePass'),
      bookingUser: formData.get('bookingUser'),
      bookingPass: formData.get('bookingPass'),
      airbnbUser: formData.get('airbnbUser'),
      airbnbPass: formData.get('airbnbPass'),
      ciaoBookingUser: formData.get('ciaoBookingUser'),
      ciaoBookingPass: formData.get('ciaoBookingPass'),
    }
  });

  redirect(`/proprietari/${id}`); // Ricarica la stessa pagina
}

// AZIONE: Modifica Immobile
export async function aggiornaImmobile(formData) {
  const id = parseInt(formData.get('id'));
  const proprietarioId = parseInt(formData.get('proprietarioId'));

  await prisma.immobile.update({
    where: { id: id },
    data: {
      nome: formData.get('nome'), // Aggiornabile
      indirizzo: formData.get('indirizzo'),
      civico: formData.get('civico'), // Aggiornamento esplicito se c'è campo separato
      zona: formData.get('zona'),
      CIN: formData.get('CIN'),
      foglio: formData.get('foglio'),
      particella: formData.get('particella'),
      subalterno: formData.get('subalterno'),
      // ID Portali
      idBooking: formData.get('idBooking'),
      idAirbnb: formData.get('idAirbnb'),
      idCiaoBooking: formData.get('idCiaoBooking'),
      metriQuadri: parseInt(formData.get('metriQuadri')) || null,
      bagni: parseInt(formData.get('bagni')) || null,
      camere: parseInt(formData.get('camere')) || null,
      postiLetto: parseInt(formData.get('postiLetto')) || null,
      postiLettoExtra: parseInt(formData.get('postiLettoExtra')) || null,
    }
  });

  // Dopo aver salvato la casa, torniamo alla pagina del proprietario
  redirect(`/proprietari/${proprietarioId}`);
}

// AZIONE: Aggiungi Immobile a Proprietario Esistente
export async function aggiungiImmobile(formData) {
  const proprietarioId = parseInt(formData.get('proprietarioId'));
  const indirizzoRaw = formData.get('indirizzo');
  const zona = formData.get('zona');

  // Logica estrazione Civico (Replicata)
  let indirizzo = indirizzoRaw;
  let civico = null;
  const civicoMatch = indirizzoRaw.match(/^(.*?)[,\s]+(\d+[a-zA-Z]?(?:\/[a-zA-Z0-9]+)?)$/);

  if (civicoMatch) {
    indirizzo = civicoMatch[1].trim();
    civico = civicoMatch[2];
  }

  // Logica Generazione Nome Immobile (Replicata)
  const prefixToRemove = ["via", "viale", "largo", "vicolo", "piazza", "piazzale", "corso", "contrada", "salita", "discesa", "calle", "fondamenta", "strada"];
  let words = indirizzo.toLowerCase().split(/\s+/);

  if (words.length > 0 && prefixToRemove.includes(words[0])) {
    words.shift();
  }

  // Find first "significant" word (skip "P.", "S.", single letters)
  let mainWord = words.length > 0 ? words[0] : "UNK";
  for (const w of words) {
    if (w.includes('.') || w.length < 2) {
      continue;
    }
    mainWord = w;
    break;
  }

  const shortCode = mainWord.substring(0, 3).toUpperCase();
  const nomeGenerato = `P${shortCode}`;

  // Conversione Numeri
  const mq = formData.get('metriQuadri') ? parseInt(formData.get('metriQuadri')) : null;
  const posti = formData.get('postiLetto') ? parseInt(formData.get('postiLetto')) : null;
  const postiExtra = formData.get('postiLettoExtra') ? parseInt(formData.get('postiLettoExtra')) : null;
  const camere = formData.get('camere') ? parseInt(formData.get('camere')) : null;
  const bagni = formData.get('bagni') ? parseInt(formData.get('bagni')) : null;

  await prisma.immobile.create({
    data: {
      nome: nomeGenerato,
      indirizzo: indirizzo,
      civico: civico,
      zona: zona,
      proprietarioId: proprietarioId,
      metriQuadri: mq,
      postiLetto: posti,
      postiLettoExtra: postiExtra,
      camere: camere,
      bagni: bagni
    }
  });

  redirect(`/proprietari/${proprietarioId}`);
}

// AZIONE: Salva Profittabilità (Bozza)
export async function salvaProfittabilita(data) {
  const id = parseInt(data.id);

  if (!id) throw new Error("ID immobile mancante");

  await prisma.immobile.update({
    where: { id: id },
    data: {
      // Dati Profittabilità
      facilities: data.facilities,
      tagli: data.tagli,
      modificheStrutturali: data.modificheStrutturali,
      migliorieImmobiliari: data.migliorieImmobiliari,

      // Analisi Simili
      camereDisponibili: parseInt(data.camereDisponibili) || null,
      bagniAnalisi: parseInt(data.bagniAnalisi) || null,
      posizionamento: data.posizionamento,
      postiLettoTotaliAnalisi: parseInt(data.postiLettoTotali) || null,
      considerazioni: data.considerazioni,

      // Parametri Gestione
      commissione: parseFloat(data.commissione) || null,

      // Previsione Stagionale
      prezzoBassa: parseFloat(data.prezzoBassa) || null,
      prezzoMedia: parseFloat(data.prezzoMedia) || null,
      prezzoAlta: parseFloat(data.prezzoAlta) || null,
      extraPax: parseFloat(data.extraPax) || null,

      percBassa: parseFloat(data.percBassa) || null,
      percMedia: parseFloat(data.percMedia) || null,
      percAlta: parseFloat(data.percAlta) || null,

      lordoAnnuo: parseFloat(data.lordoAnnuo) || null,
      guadagnoExtra: parseFloat(data.guadagnoExtra) || null,
      lordoTotale: parseFloat(data.lordoTotale) || null,
    }
  });

  // Non facciamo redirect, rimaniamo sulla pagina
  return { success: true };
}

// AZIONE: Upload Documento (SUPABASE)
import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function uploadDocumento(formData) {
  const proprietarioId = parseInt(formData.get('proprietarioId'));
  const file = formData.get('file');

  if (!file || !proprietarioId) throw new Error("File o ID mancante");

  const nomeOriginale = file.name;
  const isPdf = nomeOriginale.toLowerCase().endsWith('.pdf');
  const tipo = isPdf ? 'PDF' : 'IMG';

  // Sanitizza nome (rimuovi caratteri speciali/accenti che rompono S3)
  const safeName = nomeOriginale.replace(/[^a-zA-Z0-9.-]/g, '_');

  // Genera nome univoco
  const uniqueName = `${proprietarioId}/${Date.now()}-${safeName}`;

  // Upload su Supabase Storage (Bucket Privato)
  console.log("Tentativo upload su bucket 'documenti':", uniqueName);
  const { data, error } = await supabase
    .storage
    .from('documenti')
    .upload(uniqueName, file, {
      cacheControl: '3600',
      upsert: false
    });

  if (error) {
    console.error("Errore DETTAGLIATO Upload Supabase:", JSON.stringify(error, null, 2));
    throw new Error(`Errore Upload: ${error.message} (Code: ${error.statusCode})`);
  }
  console.log("Upload riuscito:", data);

  // Salvataggio DB
  // NOTA: Per i bucket privati, salviamo il PERCORSO (path) nel campo fileUrl.
  // L'URL firmato verrà generato al momento della visualizzazione.
  await prisma.documento.create({
    data: {
      nome: nomeOriginale,
      fileUrl: uniqueName, // Salviamo il path relativo
      tipo: tipo,
      proprietarioId: proprietarioId
    }
  });

  revalidatePath(`/proprietari/${proprietarioId}`);
  return { success: true };
}

// AZIONE: Elimina Documento (SUPABASE)
export async function eliminaDocumento(formData) {
  const id = parseInt(formData.get('id'));
  const proprietarioId = parseInt(formData.get('proprietarioId'));

  const doc = await prisma.documento.findUnique({ where: { id: id } });

  if (!doc) throw new Error("Documento non trovato");

  // Elimina da Supabase (doc.fileUrl è il path)
  const { error } = await supabase
    .storage
    .from('documenti')
    .remove([doc.fileUrl]);

  if (error) console.error("Errore cancellazione Supabase:", error);

  // Elimina DB
  await prisma.documento.delete({ where: { id: id } });

  revalidatePath(`/proprietari/${proprietarioId}`);
  return { success: true };
}