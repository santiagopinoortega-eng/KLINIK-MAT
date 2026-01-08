// lib/repositories/base.repository.ts
/**
 * BaseRepository - Clase base para todos los repositories
 * 
 * Proporciona operaciones CRUD comunes y manejo de errores
 * Facilita testing con interface clara y mockeable
 */

import { PrismaClient } from '@prisma/client';
import { prisma, prismaRO } from '@/lib/prisma';
import { DatabaseError } from '@/lib/errors/app-errors';

export interface QueryOptions {
  skip?: number;
  take?: number;
  orderBy?: any;
  where?: any;
  include?: any;
  select?: any;
}

export abstract class BaseRepository<T> {
  protected db: PrismaClient;
  protected dbRO: PrismaClient; // Read-only para queries pesadas
  protected modelName: string;

  constructor(modelName: string) {
    this.db = prisma;
    this.dbRO = prismaRO;
    this.modelName = modelName;
  }

  /**
   * Obtener cliente Prisma según operación
   */
  protected getClient(readOnly: boolean = false): any {
    return readOnly ? this.dbRO : this.db;
  }

  /**
   * Obtener modelo de Prisma (con type assertion)
   */
  protected getModel(readOnly: boolean = false): any {
    const client = this.getClient(readOnly) as any;
    return client[this.modelName];
  }

  /**
   * Wrapper para manejar errores de Prisma
   */
  protected async executeQuery<R>(
    operation: string,
    query: () => Promise<R>
  ): Promise<R> {
    try {
      return await query();
    } catch (error: any) {
      throw new DatabaseError(
        `${this.modelName}.${operation} failed: ${error.message}`,
        { originalError: error }
      );
    }
  }

  /**
   * Contar registros
   */
  async count(where?: any, readOnly: boolean = true): Promise<number> {
    return this.executeQuery('count', async () => {
      const model = this.getModel(readOnly);
      return model.count({ where });
    });
  }

  /**
   * Verificar si existe un registro
   */
  async exists(where: any, readOnly: boolean = true): Promise<boolean> {
    const count = await this.count(where, readOnly);
    return count > 0;
  }

  /**
   * Buscar por ID
   */
  async findById(
    id: string,
    options?: Pick<QueryOptions, 'include' | 'select'>,
    readOnly: boolean = true
  ): Promise<T | null> {
    return this.executeQuery('findById', async () => {
      const model = this.getModel(readOnly);
      return model.findUnique({
        where: { id },
        ...options,
      });
    });
  }

  /**
   * Buscar uno con condiciones
   */
  async findOne(
    where: any,
    options?: QueryOptions,
    readOnly: boolean = true
  ): Promise<T | null> {
    return this.executeQuery('findOne', async () => {
      const model = this.getModel(readOnly);
      return model.findFirst({
        where,
        ...options,
      });
    });
  }

  /**
   * Buscar múltiples
   */
  async findMany(
    options?: QueryOptions,
    readOnly: boolean = true
  ): Promise<T[]> {
    return this.executeQuery('findMany', async () => {
      const model = this.getModel(readOnly);
      return model.findMany(options);
    });
  }

  /**
   * Crear registro
   */
  async create(data: any, include?: any): Promise<T> {
    return this.executeQuery('create', async () => {
      const model = this.getModel(false);
      return model.create({
        data,
        include,
      });
    });
  }

  /**
   * Actualizar registro
   */
  async update(id: string, data: any, include?: any): Promise<T> {
    return this.executeQuery('update', async () => {
      const model = this.getModel(false);
      return model.update({
        where: { id },
        data,
        include,
      });
    });
  }

  /**
   * Actualizar múltiples
   */
  async updateMany(where: any, data: any): Promise<{ count: number }> {
    return this.executeQuery('updateMany', async () => {
      const model = this.getModel(false);
      return model.updateMany({
        where,
        data,
      });
    });
  }

  /**
   * Eliminar registro
   */
  async delete(id: string): Promise<T> {
    return this.executeQuery('delete', async () => {
      const model = this.getModel(false);
      return model.delete({
        where: { id },
      });
    });
  }

  /**
   * Eliminar múltiples
   */
  async deleteMany(where: any): Promise<{ count: number }> {
    return this.executeQuery('deleteMany', async () => {
      const model = this.getModel(false);
      return model.deleteMany({
        where,
      });
    });
  }

  /**
   * Crear o actualizar (upsert)
   */
  async upsert(
    where: any,
    create: any,
    update: any,
    include?: any
  ): Promise<T> {
    return this.executeQuery('upsert', async () => {
      const model = this.getModel(false);
      return model.upsert({
        where,
        create,
        update,
        include,
      });
    });
  }
}
