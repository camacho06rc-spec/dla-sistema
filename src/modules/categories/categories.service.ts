import prisma from '../../utils/prisma';
import { AppError } from '../../utils/AppError';
import { Prisma } from '@prisma/client';
import {
  CreateCategoryDTO,
  UpdateCategoryDTO,
  GetCategoriesQuery,
} from './categories.dto';

export class CategoriesService {
  // Listar con paginación y filtros
  async findAll(query: GetCategoriesQuery) {
    const { page, limit, search, isActive } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.CategoryWhereInput = {
      ...(search && {
        name: { contains: search, mode: 'insensitive' as const },
      }),
      ...(isActive !== undefined && { isActive }),
    };

    const [categories, total] = await Promise.all([
      prisma.category.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ order: 'asc' }, { name: 'asc' }],
      }),
      prisma.category.count({ where }),
    ]);

    return {
      data: categories,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // Obtener por ID
  async findById(id: string) {
    const category = await prisma.category.findUnique({
      where: { id },
    });

    if (!category) {
      throw new AppError(404, 'Categoría no encontrada');
    }

    return category;
  }

  // Crear con slug automático
  async create(data: CreateCategoryDTO, userId: string) {
    const slug = this.generateSlug(data.name);

    // Verificar slug único
    const existing = await prisma.category.findUnique({ where: { slug } });
    if (existing) {
      throw new AppError(409, 'Ya existe una categoría con ese nombre');
    }

    const category = await prisma.category.create({
      data: {
        ...data,
        slug,
      },
    });

    // Auditoría
    await this.createAuditLog(userId, 'CREATE', category.id, null, category);

    return category;
  }

  // Actualizar
  async update(id: string, data: UpdateCategoryDTO, userId: string) {
    const category = await this.findById(id);

    const updateData: Partial<UpdateCategoryDTO> & { slug?: string } = { ...data };

    // Si cambia el nombre, regenerar slug
    if (data.name && data.name !== category.name) {
      updateData.slug = this.generateSlug(data.name);

      // Verificar slug único
      const existing = await prisma.category.findFirst({
        where: { slug: updateData.slug, id: { not: id } },
      });
      if (existing) {
        throw new AppError(409, 'Ya existe una categoría con ese nombre');
      }
    }

    const updated = await prisma.category.update({
      where: { id },
      data: updateData,
    });

    // Auditoría
    await this.createAuditLog(userId, 'UPDATE', id, category, updated);

    return updated;
  }

  // Toggle activo/inactivo
  async toggle(id: string, userId: string) {
    const category = await this.findById(id);

    const updated = await prisma.category.update({
      where: { id },
      data: { isActive: !category.isActive },
    });

    await this.createAuditLog(userId, 'UPDATE', id, category, updated);

    return updated;
  }

  // Eliminar (soft delete)
  async delete(id: string, userId: string) {
    const category = await this.findById(id);

    // Verificar si tiene productos
    const productsCount = await prisma.product.count({
      where: { categoryId: id, isActive: true },
    });

    if (productsCount > 0) {
      throw new AppError(
        400,
        `No se puede eliminar. Tiene ${productsCount} productos activos asociados`
      );
    }

    await prisma.category.update({
      where: { id },
      data: { isActive: false },
    });

    await this.createAuditLog(userId, 'DELETE', id, category, null);

    return { message: 'Categoría eliminada correctamente' };
  }

  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Quitar acentos
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  private async createAuditLog(
    userId: string,
    action: 'CREATE' | 'UPDATE' | 'DELETE',
    entityId: string,
    oldValues: unknown,
    newValues: unknown
  ) {
    await prisma.auditLog.create({
      data: {
        userId,
        action,
        entity: 'CATEGORY',
        entityId,
        oldValues: oldValues || undefined,
        newValues: newValues || undefined,
      },
    });
  }
}
