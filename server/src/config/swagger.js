export const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'SyncBoard API Documentation',
    version: '1.0.0',
    description:
      'REST API and WebSocket specification for SyncBoard — Real-Time Collaborative Kanban Board. Built for AImploy Technical Assessment.',
  },
  servers: [
    {
      url: '/api',
      description: 'Current Server (Relative Path — works in local & production)',
    },
    {
      url: 'http://localhost:5000/api',
      description: 'Local Development Server',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Provide JWT token obtained from /auth/login or /auth/register',
      },
    },
    schemas: {
      User: {
        type: 'object',
        properties: {
          _id: { type: 'string', example: '65e9f8a1e4b0a1a2b3c4d5e6' },
          name: { type: 'string', example: 'Alex Morgan' },
          email: { type: 'string', example: 'alex@example.com' },
          avatar: { type: 'string', example: 'https://api.dicebear.com/...' },
        },
      },
      Board: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          title: { type: 'string', example: 'Q4 Product Roadmap' },
          description: { type: 'string', example: 'Sprint tracking board' },
          owner: { $ref: '#/components/schemas/User' },
          members: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                user: { $ref: '#/components/schemas/User' },
                role: { type: 'string', enum: ['admin', 'member'] },
              },
            },
          },
        },
      },
      Card: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          title: { type: 'string', example: 'Implement WebSocket sync' },
          description: { type: 'string', example: 'Add room broadcasting' },
          status: { type: 'string', enum: ['todo', 'in_progress', 'done'] },
          priority: { type: 'string', enum: ['low', 'medium', 'high', 'urgent'] },
          order: { type: 'number', example: 0 },
          board: { type: 'string' },
          assignee: { $ref: '#/components/schemas/User' },
        },
      },
    },
  },
  paths: {
    '/auth/register': {
      post: {
        tags: ['Authentication'],
        summary: 'Register a new user',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'email', 'password'],
                properties: {
                  name: { type: 'string', example: 'Alex Morgan' },
                  email: { type: 'string', example: 'alex@example.com' },
                  password: { type: 'string', example: 'secret123' },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'User registered successfully with JWT' },
          400: { description: 'Validation error' },
        },
      },
    },
    '/auth/login': {
      post: {
        tags: ['Authentication'],
        summary: 'Log in and obtain JWT token',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', example: 'alex@example.com' },
                  password: { type: 'string', example: 'secret123' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Authenticated successfully' },
          401: { description: 'Invalid credentials' },
        },
      },
    },
    '/auth/me': {
      get: {
        tags: ['Authentication'],
        summary: 'Get current authenticated user profile',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'Profile retrieved' },
          401: { description: 'Unauthorized' },
        },
      },
    },
    '/boards': {
      get: {
        tags: ['Boards'],
        summary: 'Get all boards for current user (owned and member)',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'List of boards' },
        },
      },
      post: {
        tags: ['Boards'],
        summary: 'Create a new board',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['title'],
                properties: {
                  title: { type: 'string', example: 'Sprint 24' },
                  description: { type: 'string', example: 'Team sprint tasks' },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Board created' },
        },
      },
    },
    '/boards/{id}': {
      get: {
        tags: ['Boards'],
        summary: 'Get board details and its cards',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: {
          200: { description: 'Board and card list' },
          403: { description: 'Forbidden (not an authorized member)' },
          404: { description: 'Board not found' },
        },
      },
      put: {
        tags: ['Boards'],
        summary: 'Update board title or description',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: {
          200: { description: 'Board updated' },
        },
      },
      delete: {
        tags: ['Boards'],
        summary: 'Delete board and all associated cards (Owner only)',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: {
          200: { description: 'Board deleted' },
          403: { description: 'Forbidden: only owner can delete' },
        },
      },
    },
    '/cards': {
      post: {
        tags: ['Cards'],
        summary: 'Create a new card on a board (broadcasts to WebSocket)',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['boardId', 'title'],
                properties: {
                  boardId: { type: 'string' },
                  title: { type: 'string', example: 'Design Landing Page' },
                  description: { type: 'string', example: 'Create wireframes' },
                  status: { type: 'string', enum: ['todo', 'in_progress', 'done'] },
                  priority: { type: 'string', enum: ['low', 'medium', 'high', 'urgent'] },
                  assignee: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Card created' },
        },
      },
    },
    '/cards/{id}': {
      put: {
        tags: ['Cards'],
        summary: 'Update card details (broadcasts to WebSocket)',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: {
          200: { description: 'Card updated' },
        },
      },
      delete: {
        tags: ['Cards'],
        summary: 'Delete card (broadcasts to WebSocket)',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: {
          200: { description: 'Card deleted' },
        },
      },
    },
    '/cards/{id}/move': {
      patch: {
        tags: ['Cards'],
        summary: 'Move card to a new column or reorder within column (broadcasts to WebSocket)',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['destinationStatus'],
                properties: {
                  destinationStatus: { type: 'string', enum: ['todo', 'in_progress', 'done'] },
                  destinationIndex: { type: 'number', example: 1 },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Card moved and reordered' },
        },
      },
    },
  },
};
