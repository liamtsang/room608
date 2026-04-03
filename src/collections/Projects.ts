import type { CollectionConfig } from 'payload'

export const Projects: CollectionConfig = {
  slug: 'projects',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'date', 'updatedAt'],
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
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
          options: [
            { label: 'News & Documentary Emmy® Award', value: 'news-documentary-emmy' },
            { label: 'Primetime Emmy® Award', value: 'primetime-emmy' },
            { label: 'Emmy® Nomination', value: 'emmy-nomination' },
            { label: 'Television Academy Honors Award', value: 'television-academy-honors' },
            { label: 'Wildscreen Award', value: 'wildscreen-award' },
            { label: 'Jackson Wildlife Award', value: 'jackson-wildlife' },
            { label: 'Daytime Entertainment Emmy® Award', value: 'daytime-emmy' },
            { label: 'Peabody Award', value: 'peabody' },
            { label: 'Webby Nomination', value: 'webby-nomination' },
            { label: 'SXSW Audience Award', value: 'sxsw-audience' },
            { label: 'BANFF Award', value: 'banff' },
            { label: 'New York Emmy® Award', value: 'new-york-emmy' },
            { label: 'Gold Hugo Award', value: 'gold-hugo' },
            { label: 'Wildscreen Panda Award', value: 'wildscreen-panda' },
          ],
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
  ],
}
