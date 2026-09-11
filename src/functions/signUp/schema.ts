export default {
  type: 'object',
  properties: {
    username: { type: 'string' },
    password: { type: 'string' },
    name: { type: 'string' },
    document: { type: 'string' },
    legalNature: { type: 'string', enum: ['PF', 'PJ'] },
  },
  required: ['username', 'password', 'name', 'document', 'legalNature'],
} as const;