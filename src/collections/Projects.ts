import type { CollectionConfig } from 'payload'
import { slugify } from '@/lib/slugify'
import { AWARD_OPTIONS } from '@/lib/awards'

export const Projects: CollectionConfig = {
  slug: 'projects',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'date', 'updatedAt'],
  },
  access: {
    read: () => true,
  },
  hooks: {
    // Derive a stable, unique URL slug from the title. Runs on create and
    // update; once a slug exists it is preserved (data carries the current
    // value on update), so URLs don't churn when the title is edited.
    beforeValidate: [
      async ({ data, req, originalDoc }) => {
        if (!data) return data
        const base = slugify(data.slug || data.title || '')
        if (!base) return data

        const id = originalDoc?.id ?? data.id
        let candidate = base
        let n = 2
        // Suffix -2, -3, … until the slug is unique (excluding this doc).
        while (true) {
          const existing = await req.payload.find({
            collection: 'projects',
            where: {
              and: [
                { slug: { equals: candidate } },
                ...(id ? [{ id: { not_equals: id } }] : []),
              ],
            },
            limit: 1,
            depth: 0,
          })
          if (existing.totalDocs === 0) break
          candidate = `${base}-${n++}`
        }
        data.slug = candidate
        return data
      },
    ],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      unique: true,
      index: true,
      admin: {
        position: 'sidebar',
        readOnly: true,
        description: 'Auto-generated from the title. Used in the project URL (/projects/<slug>).',
      },
    },
    {
      name: 'date',
      type: 'date',
      required: true,
      admin: {
        date: {
          pickerAppearance: 'dayOnly',
          displayFormat: 'dd/MM/yyyy',
        },
      },
    },
    {
      name: 'credits',
      type: 'array',
      fields: [
        {
          name: 'role',
          type: 'text',
          required: true,
        },
        {
          name: 'name',
          type: 'text',
          required: true,
        },
      ],
    },
    {
      name: 'awards',
      type: 'array',
      fields: [
        {
          name: 'type',
          type: 'select',
          required: true,
          options: AWARD_OPTIONS.map((o) => ({ ...o })),
        },
        {
          name: 'details',
          type: 'text',
        },
      ],
    },
    {
      name: 'description',
      type: 'richText',
    },
    {
      name: 'images',
      type: 'upload',
      relationTo: 'media',
      hasMany: true,
    },
    {
      name: 'scanEffect',
      label: 'Scan effect (hover overlay)',
      type: 'upload',
      relationTo: 'media',
      required: false,
      admin: {
        description: 'Optional laser-scan video overlaid on hover. Black background, screen-blended.',
      },
    },
    {
      name: 'vimeoUrl',
      label: 'Vimeo URL',
      type: 'text',
      required: false,
      admin: {
        description:
          'Vimeo video URL. For unlisted videos keep the privacy hash, e.g. https://player.vimeo.com/video/123456789?h=abcdef0123',
      },
    },
  ],
}
