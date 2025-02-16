import { rest } from 'msw'

export const handlers = [
  rest.get('/api/workflows', (req, res, ctx) => {
    return res(
      ctx.json({
        workflows: [
          {
            id: '1',
            name: 'Test Workflow',
            status: 'ACTIVE',
            config: {},
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ],
      })
    )
  }),

  rest.post('/api/workflows', (req, res, ctx) => {
    return res(
      ctx.json({
        workflow: {
          id: '2',
          name: 'New Workflow',
          status: 'INACTIVE',
          config: {},
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      })
    )
  }),

  // Add more handlers as needed
] 