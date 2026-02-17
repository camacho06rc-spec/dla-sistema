import { prisma } from '../../config/database';
import { AppError } from '../../middleware/error.middleware';
import { generateSlug } from '../../utils/slug';

export class CategoriesService {
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

    const [categories, total] = await Promise.all([
      prisma.category.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ order: 'asc' }, { name: 'asc' }]
      }),
      prisma.category.count({ where })
    ]);

    return {
      data: categories,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async findById(id: string) {
    const category = await prisma.category.findUnique({ where: { id } });
    if (!category) {
      throw new AppError(404, 'Categoría no encontrada');
    }
    return category;
  }

  async create(data: any) {
    const slug = generateSlug(data.name);
    
    const existing = await prisma.category.findUnique({ where: { slug } });
    if (existing) {
      throw new AppError(409, 'Ya existe una categoría con ese nombre');
    }

    return await prisma.category.create({
      data: { ...data, slug }
    });
  }

  async update(id: string, data: any) {
    await this.findById(id);
    
    if (data.name) {
      const slug = generateSlug(data.name);
      const existing = await prisma.category.findFirst({
        where: { slug, id: { not: id } }
      });
      if (existing) {
        throw new AppError(409, 'Ya existe una categoría con ese nombre');
      }
      data.slug = slug;
    }

    return await prisma.category.update({
      where: { id },
      data
    });
  }

  async toggle(id: string) {
    const category = await this.findById(id);
    return await prisma.category.update({
      where: { id },
      data: { isActive: !category.isActive }
    });
  }

  async delete(id: string) {
    await this.findById(id);
    
    const productsCount = await prisma.product.count({
      where: { categoryId: id, isActive: true }
    });
    
    if (productsCount > 0) {
      throw new AppError(400, `No se puede eliminar. Tiene ${productsCount} productos activos`);
    }

    await prisma.category.update({
      where: { id },
      data: { isActive: false }
    });

    return { message: 'Categoría eliminada' };
  }
}
