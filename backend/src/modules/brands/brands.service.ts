import { prisma } from '../../config/database';
import { AppError } from '../../middleware/error.middleware';

export class BrandsService {
  async findAll(query: any) {
    const { page = 1, limit = 20, search, isActive } = query;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (search) {
      where.name = { contains: search, mode: 'insensitive' };
    }
    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    const [brands, total] = await Promise.all([
      prisma.brand.findMany({
        where,
        skip,
        take: limit,
        orderBy: { name: 'asc' }
      }),
      prisma.brand.count({ where })
    ]);

    return {
      data: brands,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async findById(id: string) {
    const brand = await prisma.brand.findUnique({ where: { id } });
    if (!brand) {
      throw new AppError(404, 'Marca no encontrada');
    }
    return brand;
  }

  async create(data: any) {
    const slug = this.generateSlug(data.name);
    
    const existing = await prisma.brand.findUnique({ where: { slug } });
    if (existing) {
      throw new AppError(409, 'Ya existe una marca con ese nombre');
    }

    return await prisma.brand.create({
      data: { ...data, slug }
    });
  }

  async update(id: string, data: any) {
    await this.findById(id);
    
    if (data.name) {
      const slug = this.generateSlug(data.name);
      const existing = await prisma.brand.findFirst({
        where: { slug, id: { not: id } }
      });
      if (existing) {
        throw new AppError(409, 'Ya existe una marca con ese nombre');
      }
      data.slug = slug;
    }

    return await prisma.brand.update({
      where: { id },
      data
    });
  }

  async toggle(id: string) {
    const brand = await this.findById(id);
    return await prisma.brand.update({
      where: { id },
      data: { isActive: !brand.isActive }
    });
  }

  async delete(id: string) {
    await this.findById(id);
    
    const productsCount = await prisma.product.count({
      where: { brandId: id, isActive: true }
    });
    
    if (productsCount > 0) {
      throw new AppError(400, `No se puede eliminar. Tiene ${productsCount} productos activos`);
    }

    await prisma.brand.update({
      where: { id },
      data: { isActive: false }
    });

    return { message: 'Marca eliminada' };
  }

  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
}
