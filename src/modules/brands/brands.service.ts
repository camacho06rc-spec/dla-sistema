import prisma from '../../utils/prisma';
import { AppError } from '../../utils/AppError';
import { Prisma } from '@prisma/client';
import {
  CreateBrandDTO,
  UpdateBrandDTO,
  GetBrandsQuery,
} from './brands.dto';

export class BrandsService {
  // Listar con paginación y filtros
  async findAll(query: GetBrandsQuery) {
    const { page, limit, search, isActive } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.BrandWhereInput = {
      ...(search && {
        name: { contains: search, mode: 'insensitive' as const },
      }),
      ...(isActive !== undefined && { isActive }),
    };

    const [brands, total] = await Promise.all([
      prisma.brand.findMany({
        where,
        skip,
        take: limit,
        orderBy: { name: 'asc' },
      }),
      prisma.brand.count({ where }),
    ]);

    return {
      data: brands,
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
    const brand = await prisma.brand.findUnique({
      where: { id },
    });

    if (!brand) {
      throw new AppError(404, 'Marca no encontrada');
    }

    return brand;
  }

  // Crear con slug automático
  async create(data: CreateBrandDTO, userId: string) {
    const slug = this.generateSlug(data.name);

    // Verificar slug único
    const existing = await prisma.brand.findUnique({ where: { slug } });
    if (existing) {
      throw new AppError(409, 'Ya existe una marca con ese nombre');
    }

    const brand = await prisma.brand.create({
      data: {
        ...data,
        slug,
      },
    });

    // Auditoría
    await this.createAuditLog(userId, 'CREATE', brand.id, null, brand);

    return brand;
  }

  // Actualizar
  async update(id: string, data: UpdateBrandDTO, userId: string) {
    const brand = await this.findById(id);

    const updateData: Partial<UpdateBrandDTO> & { slug?: string } = { ...data };

    // Si cambia el nombre, regenerar slug
    if (data.name && data.name !== brand.name) {
      updateData.slug = this.generateSlug(data.name);

      // Verificar slug único
      const existing = await prisma.brand.findFirst({
        where: { slug: updateData.slug, id: { not: id } },
      });
      if (existing) {
        throw new AppError(409, 'Ya existe una marca con ese nombre');
      }
    }

    const updated = await prisma.brand.update({
      where: { id },
      data: updateData,
    });

    // Auditoría
    await this.createAuditLog(userId, 'UPDATE', id, brand, updated);

    return updated;
  }

  // Toggle activo/inactivo
  async toggle(id: string, userId: string) {
    const brand = await this.findById(id);

    const updated = await prisma.brand.update({
      where: { id },
      data: { isActive: !brand.isActive },
    });

    await this.createAuditLog(userId, 'UPDATE', id, brand, updated);

    return updated;
  }

  // Eliminar (soft delete)
  async delete(id: string, userId: string) {
    const brand = await this.findById(id);

    // Verificar si tiene productos
    const productsCount = await prisma.product.count({
      where: { brandId: id, isActive: true },
    });

    if (productsCount > 0) {
      throw new AppError(
        400,
        `No se puede eliminar. Tiene ${productsCount} productos activos asociados`
      );
    }

    await prisma.brand.update({
      where: { id },
      data: { isActive: false },
    });

    await this.createAuditLog(userId, 'DELETE', id, brand, null);

    return { message: 'Marca eliminada correctamente' };
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
        entity: 'BRAND',
        entityId,
        oldValues: oldValues || undefined,
        newValues: newValues || undefined,
      },
    });
  }
}
