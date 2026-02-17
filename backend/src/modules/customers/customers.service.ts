import { prisma } from '../../config/database';
import { AppError } from '../../middleware/error.middleware';
import { CustomerTier } from '@prisma/client';

export class CustomersService {
  async findAll(query: any) {
    // Query parameters are validated by Zod schema in controller before reaching here
    // getCustomersQuerySchema ensures page >= 1, limit is 1-100, and proper types
    const { page = 1, limit = 20, search, type, tier, isActive, isBlocked } = query;
    const skip = (page - 1) * limit;

    const where: any = {};
    
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { businessName: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search } },
        { email: { contains: search, mode: 'insensitive' } }
      ];
    }
    
    if (type) where.type = type;
    if (tier) where.tier = tier;
    if (isActive !== undefined) where.isActive = isActive;
    if (isBlocked !== undefined) where.isBlocked = isBlocked;

    const [customers, total] = await Promise.all([
      prisma.customer.findMany({
        where,
        skip,
        take: limit,
        include: {
          addresses: {
            orderBy: { isDefault: 'desc' }
          },
          _count: {
            select: {
              orders: true
            }
          }
        },
        orderBy: [
          { lastName: 'asc' },
          { firstName: 'asc' }
        ]
      }),
      prisma.customer.count({ where })
    ]);

    return {
      data: customers,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async findById(id: string) {
    const customer = await prisma.customer.findUnique({
      where: { id },
      include: {
        addresses: {
          orderBy: { isDefault: 'desc' }
        },
        orders: {
          take: 10,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            code: true,
            status: true,
            total: true,
            createdAt: true
          }
        }
      }
    });

    if (!customer) {
      throw new AppError(404, 'Cliente no encontrado');
    }

    return customer;
  }

  private async generateCustomerCode(): Promise<string> {
    // Use timestamp + random for uniqueness
    // Database has unique constraint on code field to prevent duplicates
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    const code = `CLI-${timestamp}-${random}`;
    
    return code;
  }

  async create(data: any) {
    // Verificar si ya existe un cliente con el mismo teléfono (si se proporciona)
    if (data.phone) {
      const existing = await prisma.customer.findFirst({
        where: { phone: data.phone }
      });

      if (existing) {
        throw new AppError(409, 'Ya existe un cliente con ese número de teléfono');
      }
    }

    // Verificar email único si se proporciona
    if (data.email) {
      const existingEmail = await prisma.customer.findFirst({
        where: { email: data.email }
      });

      if (existingEmail) {
        throw new AppError(409, 'Ya existe un cliente con ese email');
      }
    }

    // Generate unique code - database constraint ensures uniqueness
    const code = await this.generateCustomerCode();

    try {
      return await prisma.customer.create({
        data: {
          ...data,
          code
        },
        include: {
          addresses: true
        }
      });
    } catch (error: any) {
      // Handle unique constraint violation on code (rare race condition)
      if (error.code === 'P2002' && error.meta?.target?.includes('code')) {
        // Retry with a new code
        const newCode = await this.generateCustomerCode();
        return await prisma.customer.create({
          data: {
            ...data,
            code: newCode
          },
          include: {
            addresses: true
          }
        });
      }
      throw error;
    }
  }

  async update(id: string, data: any) {
    const customer = await this.findById(id);

    // Verificar teléfono único si se está actualizando
    if (data.phone && data.phone !== customer.phone) {
      const existing = await prisma.customer.findFirst({
        where: { phone: data.phone, id: { not: id } }
      });

      if (existing) {
        throw new AppError(409, 'Ya existe un cliente con ese número de teléfono');
      }
    }

    // Verificar email único si se está actualizando
    if (data.email && data.email !== customer.email) {
      const existing = await prisma.customer.findFirst({
        where: { email: data.email, id: { not: id } }
      });

      if (existing) {
        throw new AppError(409, 'Ya existe un cliente con ese email');
      }
    }

    return await prisma.customer.update({
      where: { id },
      data,
      include: {
        addresses: true
      }
    });
  }

  async toggleActive(id: string) {
    const customer = await this.findById(id);
    
    return await prisma.customer.update({
      where: { id },
      data: { isActive: !customer.isActive }
    });
  }

  async toggleBlock(id: string) {
    const customer = await this.findById(id);
    
    return await prisma.customer.update({
      where: { id },
      data: { isBlocked: !customer.isBlocked }
    });
  }

  async changeTier(id: string, tier: CustomerTier) {
    await this.findById(id);
    
    return await prisma.customer.update({
      where: { id },
      data: { tier }
    });
  }

  // ========== ADDRESSES ==========

  async getAddresses(customerId: string) {
    await this.findById(customerId);

    return await prisma.address.findMany({
      where: { customerId },
      orderBy: [
        { isDefault: 'desc' },
        { street: 'asc' }
      ]
    });
  }

  async createAddress(data: any) {
    await this.findById(data.customerId);

    // Si es la primera dirección, hacerla default automáticamente
    const addressCount = await prisma.address.count({
      where: { customerId: data.customerId }
    });

    if (addressCount === 0) {
      data.isDefault = true;
    }

    // Si se marca como default, quitar default de las demás
    if (data.isDefault) {
      await prisma.address.updateMany({
        where: { customerId: data.customerId },
        data: { isDefault: false }
      });
    }

    return await prisma.address.create({
      data
    });
  }

  async updateAddress(id: string, data: any) {
    const address = await prisma.address.findUnique({
      where: { id }
    });

    if (!address) {
      throw new AppError(404, 'Dirección no encontrada');
    }

    // Si se marca como default, quitar default de las demás
    if (data.isDefault) {
      await prisma.address.updateMany({
        where: { customerId: address.customerId },
        data: { isDefault: false }
      });
    }

    return await prisma.address.update({
      where: { id },
      data
    });
  }

  async deleteAddress(id: string) {
    const address = await prisma.address.findUnique({
      where: { id }
    });

    if (!address) {
      throw new AppError(404, 'Dirección no encontrada');
    }

    // Si es la dirección default y hay otras direcciones, promover otra a default
    if (address.isDefault) {
      const otherAddress = await prisma.address.findFirst({
        where: { 
          customerId: address.customerId,
          id: { not: id }
        }
      });

      if (otherAddress) {
        // Promover otra dirección a default antes de eliminar
        await prisma.address.update({
          where: { id: otherAddress.id },
          data: { isDefault: true }
        });
      }
    }

    await prisma.address.delete({
      where: { id }
    });

    return { message: 'Dirección eliminada' };
  }

  async setDefaultAddress(id: string) {
    const address = await prisma.address.findUnique({
      where: { id }
    });

    if (!address) {
      throw new AppError(404, 'Dirección no encontrada');
    }

    // Quitar default de todas las direcciones del cliente
    await prisma.address.updateMany({
      where: { customerId: address.customerId },
      data: { isDefault: false }
    });

    // Marcar esta como default
    return await prisma.address.update({
      where: { id },
      data: { isDefault: true }
    });
  }
}
