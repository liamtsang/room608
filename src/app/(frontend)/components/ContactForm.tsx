'use client'

import { useActionState } from 'react'
import { submitContact, type ContactFormState } from '../about/actions'

const initialState: ContactFormState = { status: 'idle' }

const inputClass =
  'w-full bg-transparent border border-[#515151] px-2 py-1 focus:outline-none focus:border-[#282828] rounded-sm'

export function ContactForm() {
  const [state, formAction, isPending] = useActionState(submitContact, initialState)

  if (state.status === 'success') {
    return (
      <div className="mt-8 bg-[#C6B79C] outline-1 outline-[#3D3D3D] drop-shadow-md">
        <h2 className="font-bold mb-3">Contact</h2>
        <p>Thanks — your message has been sent.</p>
      </div>
    )
  }

  return (
    <div className="mt-8">
      <h2 className="font-bold mb-3">Contact</h2>
      <form action={formAction} className="grid gap-3 max-w-md">
        <input
          type="text"
          name="company"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          className="hidden"
        />

        <div>
          {/*<label htmlFor="contact-name" className="block mb-1">
            Name
          </label>*/}
          <input
            placeholder="NAME"
            id="contact-name"
            type="text"
            name="name"
            className={inputClass}
          />
          {state.fieldErrors?.name && <p className="text-red-800 mt-1">{state.fieldErrors.name}</p>}
        </div>

        <div>
          {/*<label htmlFor="contact-email" className="block mb-1">
            Email
          </label>*/}
          <input
            placeholder="EMAIL"
            id="contact-email"
            type="email"
            name="email"
            className={inputClass}
          />
          {state.fieldErrors?.email && (
            <p className="text-red-800 mt-1">{state.fieldErrors.email}</p>
          )}
        </div>

        <div>
          {/*<label htmlFor="contact-message" className="block mb-1">
            Message
          </label>*/}
          <textarea
            placeholder="MESSAGE"
            id="contact-message"
            name="message"
            rows={5}
            className={inputClass}
          />
          {state.fieldErrors?.message && (
            <p className="text-red-800 mt-1">{state.fieldErrors.message}</p>
          )}
        </div>

        {state.status === 'error' && state.message && (
          <p className="text-red-800">{state.message}</p>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="bg-[#282828] text-white px-5 py-1 disabled:opacity-50 justify-self-start"
        >
          {isPending ? 'Sending…' : 'Send'}
        </button>
      </form>
    </div>
  )
}
