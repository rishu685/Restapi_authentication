const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Scalable REST API',
      version: '1.0.0',
      description: 'A scalable REST API with authentication and role-based access control',
      contact: {
        name: 'API Support',
        email: 'support@example.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: 'http://localhost:5000/api/v1',
        description: 'Development server'
      },
      {
        url: 'https://your-api-domain.com/api/v1',
        description: 'Production server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter JWT token'
        }
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'User ID'
            },
            username: {
              type: 'string',
              description: 'Username',
              minLength: 3,
              maxLength: 30
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'User email'
            },
            role: {
              type: 'string',
              enum: ['user', 'admin'],
              description: 'User role'
            },
            profile: {
              type: 'object',
              properties: {
                firstName: {
                  type: 'string',
                  maxLength: 50
                },
                lastName: {
                  type: 'string',
                  maxLength: 50
                },
                avatar: {
                  type: 'string',
                  format: 'uri'
                }
              }
            },
            fullName: {
              type: 'string',
              description: 'Full name (virtual field)'
            },
            isActive: {
              type: 'boolean',
              description: 'Account status'
            },
            createdAt: {
              type: 'string',
              format: 'date-time'
            },
            lastLogin: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        Task: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              description: 'Task ID'
            },
            title: {
              type: 'string',
              description: 'Task title',
              minLength: 1,
              maxLength: 200
            },
            description: {
              type: 'string',
              description: 'Task description',
              maxLength: 1000
            },
            status: {
              type: 'string',
              enum: ['pending', 'in-progress', 'completed', 'cancelled'],
              description: 'Task status'
            },
            priority: {
              type: 'string',
              enum: ['low', 'medium', 'high', 'urgent'],
              description: 'Task priority'
            },
            category: {
              type: 'string',
              description: 'Task category',
              maxLength: 50
            },
            dueDate: {
              type: 'string',
              format: 'date-time',
              description: 'Due date'
            },
            completedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Completion date'
            },
            assignedTo: {
              $ref: '#/components/schemas/User'
            },
            createdBy: {
              $ref: '#/components/schemas/User'
            },
            tags: {
              type: 'array',
              items: {
                type: 'string',
                maxLength: 30
              }
            },
            comments: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  content: {
                    type: 'string',
                    maxLength: 500
                  },
                  author: {
                    $ref: '#/components/schemas/User'
                  },
                  createdAt: {
                    type: 'string',
                    format: 'date-time'
                  }
                }
              }
            },
            isArchived: {
              type: 'boolean',
              description: 'Archive status'
            },
            createdAt: {
              type: 'string',
              format: 'date-time'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time'
            },
            duration: {
              type: 'number',
              description: 'Task duration in days (virtual field)'
            },
            isOverdue: {
              type: 'boolean',
              description: 'Overdue status (virtual field)'
            },
            daysUntilDue: {
              type: 'number',
              description: 'Days until due (virtual field)'
            }
          }
        },
        ApiResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              description: 'Request success status'
            },
            message: {
              type: 'string',
              description: 'Response message'
            },
            data: {
              type: 'object',
              description: 'Response data'
            }
          }
        },
        ValidationError: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            message: {
              type: 'string',
              example: 'Validation failed'
            },
            errors: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  field: {
                    type: 'string'
                  },
                  message: {
                    type: 'string'
                  },
                  value: {
                    type: 'string'
                  }
                }
              }
            }
          }
        },
        Pagination: {
          type: 'object',
          properties: {
            current: {
              type: 'number',
              description: 'Current page number'
            },
            pages: {
              type: 'number',
              description: 'Total number of pages'
            },
            total: {
              type: 'number',
              description: 'Total number of items'
            },
            limit: {
              type: 'number',
              description: 'Items per page'
            }
          }
        }
      },
      responses: {
        UnauthorizedError: {
          description: 'Authentication token is missing or invalid',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: {
                    type: 'boolean',
                    example: false
                  },
                  message: {
                    type: 'string',
                    example: 'Authentication failed'
                  }
                }
              }
            }
          }
        },
        ForbiddenError: {
          description: 'Insufficient permissions',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: {
                    type: 'boolean',
                    example: false
                  },
                  message: {
                    type: 'string',
                    example: 'Insufficient permissions'
                  }
                }
              }
            }
          }
        },
        NotFoundError: {
          description: 'Resource not found',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: {
                    type: 'boolean',
                    example: false
                  },
                  message: {
                    type: 'string',
                    example: 'Resource not found'
                  }
                }
              }
            }
          }
        },
        ValidationError: {
          description: 'Validation error',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ValidationError'
              }
            }
          }
        },
        InternalServerError: {
          description: 'Internal server error',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: {
                    type: 'boolean',
                    example: false
                  },
                  message: {
                    type: 'string',
                    example: 'Internal Server Error'
                  }
                }
              }
            }
          }
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ],
    tags: [
      {
        name: 'Authentication',
        description: 'User authentication and profile management'
      },
      {
        name: 'Tasks',
        description: 'Task management operations'
      }
    ]
  },
  apis: ['./src/routes/*.js'] // Path to the API files
};

const specs = swaggerJsdoc(options);

const swaggerOptions = {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Scalable REST API Documentation',
  customfavIcon: '/favicon.ico',
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true,
    docExpansion: 'none',
    filter: true,
    showExtensions: true,
    showCommonExtensions: true,
    tryItOutEnabled: true
  }
};

module.exports = {
  specs,
  swaggerUi,
  swaggerOptions
};