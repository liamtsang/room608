'use server'

import { getPayload } from 'payload'
import config from '@/payload.config'

export type ContactFormState = {
  status: 'idle' | 'success' | 'error'
  message?: string
  fieldErrors?: {
    name?: string
    email?: string
    message?: string
  }
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function submitContact(
  _prev: ContactFormState,
  formData: FormData,
): Promise<ContactFormState> {
  // Honeypot: bots fill every field. Report fake success so they get no signal.
  const honeypot = String(formData.get('company') ?? '').trim()
  if (honeypot) {
    return { status: 'success' }
  }

  const name = String(formData.get('name') ?? '').trim()
  const email = String(formData.get('email') ?? '').trim()
  const message = String(formData.get('message') ?? '').trim()

  const fieldErrors: ContactFormState['fieldErrors'] = {}
  if (!name) fieldErrors.name = 'Name is required.'
  else if (name.length > 200) fieldErrors.name = 'Name must be 200 characters or fewer.'

  if (!email) fieldErrors.email = 'Email is required.'
  else if (!EMAIL_RE.test(email)) fieldErrors.email = 'Enter a valid email address.'

  if (!message) fieldErrors.message = 'Message is required.'
  else if (message.length > 5000) fieldErrors.message = 'Message must be 5000 characters or fewer.'

  if (Object.keys(fieldErrors).length > 0) {
    return { status: 'error', fieldErrors }
  }

  try {
    const payload = await getPayload({ config: await config })
    await payload.create({
      collection: 'contact-submissions',
      data: { name, email, message },
      overrideAccess: true,
    })
    return { status: 'success' }
  } catch (error) {
    console.error('Failed to save contact submission', error)
    return { status: 'error', message: 'Something went wrong. Please try again.' }
  }
}
