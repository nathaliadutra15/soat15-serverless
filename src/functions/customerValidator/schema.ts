export default {
  type: 'object',
  properties: {
    document: { type: 'string' },
  },
  required: ['document'],
} as const;