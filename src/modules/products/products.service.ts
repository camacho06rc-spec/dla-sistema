import prisma from '../../utils/prisma';
import { AppError } from '../../utils/AppError';
import {
  CreateProductDTO,
  UpdateProductDTO,
  UpdateProductPricesDTO,
  GetProductsQuery,
  AddProductImageDTO,
  UpdateImageOrderDTO,
} from './products.dto';

export class ProductsService {
  // Crear producto con precios iniciales
  async create(data: CreateProductDTO, userId: string) {
    const { prices, ...productData } = data;

    // Verificar categoría y marca existen
    await this.validateCategoryAndBrand(data.categoryId, data.brandId);

    // Generar slug único
    const slug = await this.generateUniqueSlug(data.name);

    // Verificar SKU único si se proporciona
    if (data.sku) {
      const existing = await prisma.product.findUnique({
        where: { sku: data.sku },
      });
      if (existing) {
        throw new AppError(409, 'El SKU ya está en uso');
      }
    }

    // Crear producto con precios en transacción
    const product = await prisma.$transaction(async (tx) => {
      // Crear producto
      const newProduct = await tx.product.create({
        data: {
          ...productData,
          slug,
        },
        include: {
          category: true,
          brand: true,
        },
      });

      // Crear precios iniciales
      await tx.productPrice.create({
        data: {
          productId: newProduct.id,
          ...prices,
        },
      });

      // Crear historial de precios
      await tx.productPriceHistory.create({
        data: {
          productId: newProduct.id,
          ...prices,
          validFrom: new Date(),
          changedBy: userId,
          reason: 'Precios iniciales',
        },
      });

      return newProduct;
    });

    // Auditoría
    await this.createAuditLog(userId, 'CREATE', product.id, null, product);

    return await this.findById(product.id);
  }

  // Actualizar producto
  async update(id: string, data: UpdateProductDTO, userId: string) {
    const product = await this.findById(id);

    // Si cambia categoría o marca, validar
    if (data.categoryId || data.brandId) {
      await this.validateCategoryAndBrand(
        data.categoryId || product.categoryId,
        data.brandId || product.brandId
      );
    }

    const updateData: any = { ...data };

    // Si cambia el nombre, regenerar slug
    if (data.name && data.name !== product.name) {
      updateData.slug = await this.generateUniqueSlug(data.name, id);
    }

    // Verificar SKU único si se proporciona
    if (data.sku && data.sku !== product.sku) {
      const existing = await prisma.product.findFirst({
        where: { sku: data.sku, id: { not: id } },
      });
      if (existing) {
        throw new AppError(409, 'El SKU ya está en uso');
      }
    }

    const updated = await prisma.product.update({
      where: { id },
      data: updateData,
    });

    await this.createAuditLog(userId, 'UPDATE', id, product, updated);

    return await this.findById(id);
  }

  // Actualizar precios (genera historial automático)
  async updatePrices(id: string, data: UpdateProductPricesDTO, userId: string) {
    await this.findById(id);

    await prisma.$transaction(async (tx) => {
      // Cerrar precio actual en historial
      await tx.productPriceHistory.updateMany({
        where: {
          productId: id,
          validTo: null,
        },
        data: {
          validTo: new Date(),
        },
      });

      // Actualizar precios actuales
      await tx.productPrice.updateMany({
        where: { productId: id },
        data: {
          priceEventual: data.priceEventual,
          priceFrecuente: data.priceFrecuente,
          priceVip: data.priceVip,
        },
      });

      // Crear nuevo registro en historial
      await tx.productPriceHistory.create({
        data: {
          productId: id,
          priceEventual: data.priceEventual,
          priceFrecuente: data.priceFrecuente,
          priceVip: data.priceVip,
          validFrom: new Date(),
          changedBy: userId,
          reason: data.reason,
        },
      });
    });

    await this.createAuditLog(userId, 'UPDATE_PRICES', id, null, data);

    return await this.findById(id);
  }

  // Obtener con precios actuales
  async findById(id: string) {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        brand: true,
        prices: {
          where: { isActive: true },
          take: 1,
        },
        images: {
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!product) {
      throw new AppError(404, 'Producto no encontrado');
    }

    return {
      ...product,
      currentPrice: product.prices[0] || null,
    };
  }

  // Listar con filtros avanzados
  async findAll(query: GetProductsQuery) {
    const { page, limit, search, categoryId, brandId, isActive, isReturnable } =
      query;
    const skip = (page - 1) * limit;

    const where: any = {
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' as const } },
          { sku: { contains: search, mode: 'insensitive' as const } },
        ],
      }),
      ...(categoryId && { categoryId }),
      ...(brandId && { brandId }),
      ...(isActive !== undefined && { isActive }),
      ...(isReturnable !== undefined && { isReturnable }),
    };

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        include: {
          category: { select: { id: true, name: true, slug: true } },
          brand: { select: { id: true, name: true, slug: true } },
          prices: {
            where: { isActive: true },
            take: 1,
          },
        },
        orderBy: { name: 'asc' },
      }),
      prisma.product.count({ where }),
    ]);

    return {
      data: products.map((p) => ({
        ...p,
        currentPrice: p.prices[0] || null,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // Toggle activo/inactivo
  async toggle(id: string, userId: string) {
    const product = await this.findById(id);

    const updated = await prisma.product.update({
      where: { id },
      data: { isActive: !product.isActive },
    });

    await this.createAuditLog(userId, 'UPDATE', id, product, updated);

    return await this.findById(id);
  }

  // Eliminar (soft delete)
  async delete(id: string, userId: string) {
    const product = await this.findById(id);

    await prisma.product.update({
      where: { id },
      data: { isActive: false },
    });

    await this.createAuditLog(userId, 'DELETE', id, product, null);

    return { message: 'Producto eliminado correctamente' };
  }

  // Historial de precios
  async getPriceHistory(id: string) {
    await this.findById(id); // Verificar que existe

    return await prisma.productPriceHistory.findMany({
      where: { productId: id },
      orderBy: { validFrom: 'desc' },
      include: {
        changedByUser: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });
  }

  // Agregar imagen a galería
  async addImage(productId: string, data: AddProductImageDTO, userId: string) {
    await this.findById(productId);

    const image = await prisma.productImage.create({
      data: {
        productId,
        ...data,
      },
    });

    await this.createAuditLog(userId, 'ADD_IMAGE', productId, null, image);

    return image;
  }

  // Eliminar imagen
  async deleteImage(productId: string, imageId: string, userId: string) {
    await this.findById(productId);

    const image = await prisma.productImage.findFirst({
      where: { id: imageId, productId },
    });

    if (!image) {
      throw new AppError(404, 'Imagen no encontrada');
    }

    await prisma.productImage.delete({ where: { id: imageId } });

    await this.createAuditLog(
      userId,
      'DELETE_IMAGE',
      productId,
      image,
      null
    );

    return { message: 'Imagen eliminada' };
  }

  // Actualizar orden de imagen
  async updateImageOrder(
    productId: string,
    imageId: string,
    data: UpdateImageOrderDTO
  ) {
    await this.findById(productId);

    const image = await prisma.productImage.findFirst({
      where: { id: imageId, productId },
    });

    if (!image) {
      throw new AppError(404, 'Imagen no encontrada');
    }

    const updated = await prisma.productImage.update({
      where: { id: imageId },
      data: { order: data.order },
    });

    return updated;
  }

  private async generateUniqueSlug(
    name: string,
    excludeId?: string
  ): Promise<string> {
    const baseSlug = name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    let slug = baseSlug;
    let counter = 1;

    while (true) {
      const existing = await prisma.product.findUnique({ where: { slug } });
      if (!existing || (excludeId && existing.id === excludeId)) {
        break;
      }
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    return slug;
  }

  private async validateCategoryAndBrand(
    categoryId: string,
    brandId: string
  ) {
    const [category, brand] = await Promise.all([
      prisma.category.findUnique({ where: { id: categoryId } }),
      prisma.brand.findUnique({ where: { id: brandId } }),
    ]);

    if (!category) {
      throw new AppError(404, 'Categoría no encontrada');
    }
    if (!brand) {
      throw new AppError(404, 'Marca no encontrada');
    }
    if (!category.isActive) {
      throw new AppError(400, 'La categoría está inactiva');
    }
    if (!brand.isActive) {
      throw new AppError(400, 'La marca está inactiva');
    }
  }

  private async createAuditLog(
    userId: string,
    action: 'CREATE' | 'UPDATE' | 'DELETE' | 'UPDATE_PRICES' | 'ADD_IMAGE' | 'DELETE_IMAGE',
    entityId: string,
    oldValues: any,
    newValues: any
  ) {
    await prisma.auditLog.create({
      data: {
        userId,
        action,
        entity: 'PRODUCT',
        entityId,
        oldValues: oldValues || undefined,
        newValues: newValues || undefined,
      },
    });
  }
}
