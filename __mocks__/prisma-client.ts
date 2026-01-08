// __mocks__/prisma-client.ts
/**
 * Mock for @prisma/client used in tests
 */

// Prisma error codes enum
export const Prisma = {
  // Error codes
  PrismaClientKnownRequestError: class extends Error {
    code: string;
    meta?: Record<string, any>;

    constructor(message: string, { code, meta }: { code: string; meta?: Record<string, any> }) {
      super(message);
      this.name = 'PrismaClientKnownRequestError';
      this.code = code;
      this.meta = meta;
    }
  },

  PrismaClientUnknownRequestError: class extends Error {
    constructor(message: string) {
      super(message);
      this.name = 'PrismaClientUnknownRequestError';
    }
  },

  PrismaClientRustPanicError: class extends Error {
    constructor(message: string) {
      super(message);
      this.name = 'PrismaClientRustPanicError';
    }
  },

  PrismaClientInitializationError: class extends Error {
    constructor(message: string) {
      super(message);
      this.name = 'PrismaClientInitializationError';
    }
  },

  PrismaClientValidationError: class extends Error {
    constructor(message: string) {
      super(message);
      this.name = 'PrismaClientValidationError';
    }
  },

  // Query engine types
  NullableJsonNullValueInput: {
    DbNull: 'DbNull',
    JsonNull: 'JsonNull',
  },

  // Common error codes
  ErrorCode: {
    P2002: 'P2002', // Unique constraint violation
    P2025: 'P2025', // Record not found
    P2003: 'P2003', // Foreign key constraint
  },
};

// Export PrismaClient type-compatible mock
export class PrismaClient {
  user: any;
  caso: any;
  favorite: any;
  result: any;
  userGame: any;
  subscription: any;
  subscriptionPlan: any;
  
  constructor() {
    this.user = {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    };
    
    this.caso = {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    };
    
    this.favorite = {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    };
    
    this.result = {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    };
    
    this.userGame = {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      upsert: jest.fn(),
    };
    
    this.subscription = {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    };
    
    this.subscriptionPlan = {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    };
  }

  $connect = jest.fn();
  $disconnect = jest.fn();
  $transaction = jest.fn((callback) => callback(this));
  $executeRaw = jest.fn();
  $queryRaw = jest.fn();
}
