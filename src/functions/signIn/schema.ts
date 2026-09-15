export default {
  type: 'object',
  properties: {
    document: { type: 'string' },
    password: { type: 'string' },
  },
  required: ['document', 'password'],
} as const;