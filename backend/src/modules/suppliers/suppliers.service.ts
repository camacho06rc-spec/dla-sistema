import { prisma } from '../../config/database';
import { AppError } from '../../middleware/error.middleware';
import {
  CreateSupplierDTO,
  UpdateSupplierDTO,
  ToggleBlockSupplierDTO,
  CreateContactDTO,
  UpdateContactDTO,
  AddProductDTO,
  UpdateSupplierProductDTO,
  SuppliersQueryDTO,
} from './suppliers.dto';

export class SuppliersService {
  // ==========================================
  // SUPPLIERS CRUD
  // ==========================================

  async getAll(query: SuppliersQueryDTO) {
    const { search, isActive, isBlocked, page = '1', limit = '20' } = query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};

    if (search) {
      where.OR = [
        { businessName: { contains: search, mode: 'insensitive' } },
        { tradeName: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
        { rfc: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (isActive !== undefined) {
      where.isActive = isActive === 'true';
    }

    if (isBlocked !== undefined) {
      where.isBlocked = isBlocked === 'true';
    }

    const [suppliers, total] = await Promise.all([
      prisma.supplier.findMany({
        where,
        include: {
          contacts: {
            where: { isMain: true },
            take: 1,
          },
          _count: {
            select: {
              products: true,
              contacts: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limitNum,
      }),
      prisma.supplier.count({ where }),
    ]);

    return {
      suppliers,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    };
  }

  async getById(id: string) {
    const supplier = await prisma.supplier.findUnique({
      where: { id },
      include: {
        contacts: {
          orderBy: [
            { isMain: 'desc' },
            { firstName: 'asc' },
          ],
        },
        products: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                sku: true,
                piecesPerBox: true,
                brand: { select: { name: true } },
                category: { select: { name: true } },
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        _count: {
          select: {
            products: true,
            contacts: true,
          },
        },
      },
    });

    if (!supplier) {
      throw new AppError(404, 'Supplier not found');
    }

    return supplier;
  }

  async create(data: CreateSupplierDTO) {
    const code = `PROV-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

    if (data.rfc) {
      const existing = await prisma.supplier.findUnique({
        where: { rfc: data.rfc },
      });
      if (existing) {
        throw new AppError(409, 'RFC already exists');
      }
    }

    const supplier = await prisma.supplier.create({
      data: {
        ...data,
        code,
      },
      include: {
        contacts: true,
      },
    });

    return supplier;
  }

  async update(id: string, data: UpdateSupplierDTO) {
    const existing = await prisma.supplier.findUnique({ where: { id } });
    if (!existing) {
      throw new AppError(404, 'Supplier not found');
    }

    if (data.rfc && data.rfc !== existing.rfc) {
      const rfcExists = await prisma.supplier.findUnique({
        where: { rfc: data.rfc },
      });
      if (rfcExists) {
        throw new AppError(409, 'RFC already exists');
      }
    }

    const supplier = await prisma.supplier.update({
      where: { id },
      data,
      include: {
        contacts: true,
      },
    });

    return supplier;
  }

  async toggleActive(id: string) {
    const supplier = await prisma.supplier.findUnique({ where: { id } });
    if (!supplier) {
      throw new AppError(404, 'Supplier not found');
    }

    return prisma.supplier.update({
      where: { id },
      data: { isActive: !supplier.isActive },
    });
  }

  async toggleBlock(id: string, data: ToggleBlockSupplierDTO) {
    const supplier = await prisma.supplier.findUnique({ where: { id } });
    if (!supplier) {
      throw new AppError(404, 'Supplier not found');
    }

    const isBlocked = !supplier.isBlocked;

    return prisma.supplier.update({
      where: { id },
      data: {
        isBlocked,
        blockedReason: isBlocked ? data.reason : null,
        blockedAt: isBlocked ? new Date() : null,
      },
    });
  }

  async delete(id: string) {
    const supplier = await prisma.supplier.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            products: true,
          },
        },
      },
    });

    if (!supplier) {
      throw new AppError(404, 'Supplier not found');
    }

    if (supplier._count.products > 0) {
      throw new AppError(409, 'Cannot delete supplier with associated products');
    }

    await prisma.supplier.delete({ where: { id } });

    return { message: 'Supplier deleted successfully' };
  }

  // ==========================================
  // CONTACTS
  // ==========================================

  async getContacts(supplierId: string) {
    const supplier = await prisma.supplier.findUnique({
      where: { id: supplierId },
    });

    if (!supplier) {
      throw new AppError(404, 'Supplier not found');
    }

    return prisma.supplierContact.findMany({
      where: { supplierId },
      orderBy: [
        { isMain: 'desc' },
        { firstName: 'asc' },
      ],
    });
  }

  async createContact(supplierId: string, data: CreateContactDTO) {
    const supplier = await prisma.supplier.findUnique({
      where: { id: supplierId },
    });

    if (!supplier) {
      throw new AppError(404, 'Supplier not found');
    }

    if (data.isMain) {
      await prisma.supplierContact.updateMany({
        where: { supplierId, isMain: true },
        data: { isMain: false },
      });
    }

    return prisma.supplierContact.create({
      data: {
        ...data,
        supplierId,
      },
    });
  }

  async updateContact(supplierId: string, contactId: string, data: UpdateContactDTO) {
    const contact = await prisma.supplierContact.findFirst({
      where: { id: contactId, supplierId },
    });

    if (!contact) {
      throw new AppError(404, 'Contact not found');
    }

    if (data.isMain) {
      await prisma.supplierContact.updateMany({
        where: { supplierId, isMain: true, id: { not: contactId } },
        data: { isMain: false },
      });
    }

    return prisma.supplierContact.update({
      where: { id: contactId },
      data,
    });
  }

  async deleteContact(supplierId: string, contactId: string) {
    const contact = await prisma.supplierContact.findFirst({
      where: { id: contactId, supplierId },
    });

    if (!contact) {
      throw new AppError(404, 'Contact not found');
    }

    await prisma.supplierContact.delete({
      where: { id: contactId },
    });

    return { message: 'Contact deleted successfully' };
  }

  // ==========================================
  // PRODUCTS
  // ==========================================

  async getProducts(supplierId: string) {
    const supplier = await prisma.supplier.findUnique({
      where: { id: supplierId },
    });

    if (!supplier) {
      throw new AppError(404, 'Supplier not found');
    }

    return prisma.supplierProduct.findMany({
      where: { supplierId },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            sku: true,
            piecesPerBox: true,
            isActive: true,
            brand: { select: { name: true } },
            category: { select: { name: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async addProduct(supplierId: string, data: AddProductDTO) {
    const supplier = await prisma.supplier.findUnique({
      where: { id: supplierId },
    });

    if (!supplier) {
      throw new AppError(404, 'Supplier not found');
    }

    const product = await prisma.product.findUnique({
      where: { id: data.productId },
    });

    if (!product) {
      throw new AppError(404, 'Product not found');
    }

    const existing = await prisma.supplierProduct.findUnique({
      where: {
        supplierId_productId: {
          supplierId,
          productId: data.productId,
        },
      },
    });

    if (existing) {
      throw new AppError(409, 'Product already associated with this supplier');
    }

    if (data.isPreferred) {
      await prisma.supplierProduct.updateMany({
        where: { productId: data.productId, isPreferred: true },
        data: { isPreferred: false },
      });
    }

    return prisma.supplierProduct.create({
      data: {
        ...data,
        supplierId,
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            sku: true,
          },
        },
      },
    });
  }

  async updateSupplierProduct(
    supplierId: string,
    productId: string,
    data: UpdateSupplierProductDTO
  ) {
    const existing = await prisma.supplierProduct.findUnique({
      where: {
        supplierId_productId: {
          supplierId,
          productId,
        },
      },
    });

    if (!existing) {
      throw new AppError(404, 'Product not associated with this supplier');
    }

    if (data.isPreferred) {
      await prisma.supplierProduct.updateMany({
        where: {
          productId,
          isPreferred: true,
          supplierId: { not: supplierId },
        },
        data: { isPreferred: false },
      });
    }

    return prisma.supplierProduct.update({
      where: {
        supplierId_productId: {
          supplierId,
          productId,
        },
      },
      data,
      include: {
        product: {
          select: {
            id: true,
            name: true,
            sku: true,
          },
        },
      },
    });
  }

  async removeProduct(supplierId: string, productId: string) {
    const existing = await prisma.supplierProduct.findUnique({
      where: {
        supplierId_productId: {
          supplierId,
          productId,
        },
      },
    });

    if (!existing) {
      throw new AppError(404, 'Product not associated with this supplier');
    }

    await prisma.supplierProduct.delete({
      where: {
        supplierId_productId: {
          supplierId,
          productId,
        },
      },
    });

    return { message: 'Product removed from supplier successfully' };
  }
}
