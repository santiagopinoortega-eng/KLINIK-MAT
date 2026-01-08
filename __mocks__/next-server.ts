// __mocks__/next-server.ts
/**
 * Mock for next/server module in tests
 * Provides test-friendly implementations of NextRequest and NextResponse
 */

export class NextRequest {
  url: string;
  method: string;
  headers: Map<string, string>;
  body: any;
  private _json: any;

  constructor(url: string | URL, init?: RequestInit & { nextConfig?: any }) {
    this.url = typeof url === 'string' ? url : url.toString();
    this.method = init?.method || 'GET';
    this.headers = new Map();
    
    if (init?.headers) {
      Object.entries(init.headers).forEach(([key, value]) => {
        this.headers.set(key, value as string);
      });
    }
    
    this.body = init?.body;
  }

  async json() {
    if (this._json) return this._json;
    if (typeof this.body === 'string') {
      return JSON.parse(this.body);
    }
    return this.body;
  }

  get cookies() {
    return {
      get: (name: string) => ({ value: `mock-${name}` }),
      getAll: () => [],
      set: jest.fn(),
      delete: jest.fn(),
    };
  }
}

export class NextResponse {
  static json(data: any, init?: ResponseInit) {
    const response = {
      status: init?.status || 200,
      headers: new Map(Object.entries(init?.headers || {})),
      json: async () => data,
      data,
    };
    return response;
  }

  static redirect(url: string | URL, status?: number) {
    return {
      status: status || 307,
      headers: new Map([['Location', url.toString()]]),
      redirect: true,
    };
  }

  static next() {
    return {
      status: 200,
      next: true,
    };
  }
}

// Mock auth from @clerk/nextjs/server
export const auth = jest.fn();

export default { NextRequest, NextResponse, auth };
