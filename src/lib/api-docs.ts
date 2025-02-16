import { createSwaggerSpec } from 'next-swagger-doc'

export const apiSpec = createSwaggerSpec({
  openapi: '3.0.0',
  info: {
    title: 'CopyCoder API Documentation',
    version: '1.0.0',
    description: 'API documentation for CopyCoder platform',
  },
  servers: [
    {
      url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
      description: 'API server',
    },
  ],
  security: [
    {
      bearerAuth: [],
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
  },
}) 