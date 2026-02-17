import { prisma } from '../../config/database';
import { AppError } from '../../middleware/error.middleware';

export class ProductsService {
  async findAll(query: any) {
    const { 
      page = 1, 
      limit = 20, 
      search, 
      categoryId, 
      brandId, 
      isActive,
      isReturnable,
      grantsPoints
    } = query;
    const skip = (page - 1) * limit;

    const where: any = {};
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }
    
    if (categoryId) where.categoryId = categoryId;
    if (brandId) where.brandId = brandId;
    if (isActive !== undefined) where.isActive = isActive;
    if (isReturnable !== undefined) where.isReturnable = isReturnable;
    if (grantsPoints !== undefined) where.grantsPoints = grantsPoints;

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        include: {
          category: { select: { id: true, name: true, slug: true } },
          brand: { select: { id: true, name: true, slug: true } },
          productPrices: true,
          productImages: { orderBy: { order: 'asc' } }
        },
        orderBy: { name: 'asc' }
      }),
      prisma.product.count({ where })
    ]);

    return {
      data: products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async findById(id: string) {
    const product = await prisma.product.findUnique({ 
      where: { id },
      include: {
        category: { select: { id: true, name: true, slug: true } },
        brand: { select: { id: true, name: true, slug: true } },
        productPrices: true,
        productImages: { orderBy: { order: 'asc' } }
      }
    });
    
    if (!product) {
      throw new AppError(404, 'Producto no encontrado');
    }
    return product;
  }

  async create(data: any, userId?: string) {
    const slug = this.generateSlug(data.name);
    
    // Check if slug or SKU already exists
    const existingSlug = await prisma.product.findUnique({ where: { slug } });
    if (existingSlug) {
      throw new AppError(409, 'Ya existe un producto con ese nombre');
    }
    
    const existingSku = await prisma.product.findUnique({ where: { sku: data.sku } });
    if (existingSku) {
      throw new AppError(409, 'Ya existe un producto con ese SKU');
    }

    // Verify category and brand exist
    const [category, brand] = await Promise.all([
      prisma.category.findUnique({ where: { id: data.categoryId } }),
      prisma.brand.findUnique({ where: { id: data.brandId } })
    ]);

    if (!category) {
      throw new AppError(404, 'Categoría no encontrada');
    }
    if (!brand) {
      throw new AppError(404, 'Marca no encontrada');
    }

    const { prices, ...productData } = data;

    // Create product with prices
    const product = await prisma.product.create({
      data: {
        ...productData,
        slug,
        productPrices: {
          create: prices
        },
        productPriceHistory: {
          create: {
            ...prices,
            validFrom: new Date(),
            changedBy: userId,
            reason: 'Precio inicial'
          }
        }
      },
      include: {
        category: { select: { id: true, name: true, slug: true } },
        brand: { select: { id: true, name: true, slug: true } },
        productPrices: true,
        productImages: true
      }
    });

    return product;
  }

  async update(id: string, data: any) {
    await this.findById(id);
    
    if (data.name) {
      const slug = this.generateSlug(data.name);
      const existing = await prisma.product.findFirst({
        where: { slug, id: { not: id } }
      });
      if (existing) {
        throw new AppError(409, 'Ya existe un producto con ese nombre');
      }
      data.slug = slug;
    }

    // Verify category and brand if provided
    if (data.categoryId) {
      const category = await prisma.category.findUnique({ where: { id: data.categoryId } });
      if (!category) {
        throw new AppError(404, 'Categoría no encontrada');
      }
    }

    if (data.brandId) {
      const brand = await prisma.brand.findUnique({ where: { id: data.brandId } });
      if (!brand) {
        throw new AppError(404, 'Marca no encontrada');
      }
    }

    const product = await prisma.product.update({
      where: { id },
      data,
      include: {
        category: { select: { id: true, name: true, slug: true } },
        brand: { select: { id: true, name: true, slug: true } },
        productPrices: true,
        productImages: { orderBy: { order: 'asc' } }
      }
    });

    return product;
  }

  async updatePrices(id: string, pricesData: any, userId?: string) {
    const product = await this.findById(id);

    // Close current price history
    await prisma.productPriceHistory.updateMany({
      where: {
        productId: id,
        validTo: null
      },
      data: {
        validTo: new Date()
      }
    });

    // Update current prices
    const prices = await prisma.productPrice.upsert({
      where: { productId: id },
      update: {
        priceEventual: pricesData.priceEventual,
        priceFrecuente: pricesData.priceFrecuente,
        priceVip: pricesData.priceVip
      },
      create: {
        productId: id,
        priceEventual: pricesData.priceEventual,
        priceFrecuente: pricesData.priceFrecuente,
        priceVip: pricesData.priceVip
      }
    });

    // Create new price history entry
    await prisma.productPriceHistory.create({
      data: {
        productId: id,
        priceEventual: pricesData.priceEventual,
        priceFrecuente: pricesData.priceFrecuente,
        priceVip: pricesData.priceVip,
        validFrom: new Date(),
        changedBy: userId,
        reason: pricesData.reason || 'Actualización de precios'
      }
    });

    return prices;
  }

  async getPriceHistory(id: string) {
    await this.findById(id);

    const history = await prisma.productPriceHistory.findMany({
      where: { productId: id },
      orderBy: { validFrom: 'desc' },
      include: {
        changedByUser: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });

    return history;
  }

  async toggle(id: string) {
    const product = await this.findById(id);
    return await prisma.product.update({
      where: { id },
      data: { isActive: !product.isActive },
      include: {
        category: { select: { id: true, name: true, slug: true } },
        brand: { select: { id: true, name: true, slug: true } },
        productPrices: true,
        productImages: { orderBy: { order: 'asc' } }
      }
    });
  }

  async delete(id: string) {
    await this.findById(id);

    await prisma.product.update({
      where: { id },
      data: { isActive: false }
    });

    return { message: 'Producto eliminado' };
  }

  async addImage(id: string, imageData: any) {
    await this.findById(id);

    const image = await prisma.productImage.create({
      data: {
        productId: id,
        imageUrl: imageData.imageUrl,
        order: imageData.order || 0
      }
    });

    return image;
  }

  async deleteImage(productId: string, imageId: string) {
    await this.findById(productId);

    const image = await prisma.productImage.findUnique({ where: { id: imageId } });
    if (!image) {
      throw new AppError(404, 'Imagen no encontrada');
    }

    if (image.productId !== productId) {
      throw new AppError(400, 'La imagen no pertenece a este producto');
    }

    await prisma.productImage.delete({ where: { id: imageId } });

    return { message: 'Imagen eliminada' };
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
