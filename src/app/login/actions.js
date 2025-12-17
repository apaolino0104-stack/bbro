'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function login(formData) {
    const supabase = await createClient()

    // Type-casting or direct access
    const email = formData.get('email')
    const password = formData.get('password')

    const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
    })

    if (error) {
        return { error: 'Credenziali non valide' }
    }

    revalidatePath('/', 'layout')
    redirect('/')
}
