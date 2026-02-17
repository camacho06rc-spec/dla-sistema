import { prisma } from '../../config/database';
import { hashPassword, comparePassword } from '../../utils/bcrypt';
import { generateToken, generateRefreshToken } from '../../utils/jwt';
import { RegisterDto, LoginDto } from './auth.dto';

export class AuthService {
  async register(data: RegisterDto) {
    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: data.email || undefined },
          { phone: data.phone || undefined },
        ],
      },
    });

    if (existingUser) {
      throw new Error('User with this email or phone already exists');
    }

    // Hash password
    const hashedPassword = await hashPassword(data.password);

    // Create user
    const user = await prisma.user.create({
      data: {
        email: data.email,
        phone: data.phone,
        password: hashedPassword,
        firstName: data.firstName,
        lastName: data.lastName,
      },
      select: {
        id: true,
        email: true,
        phone: true,
        firstName: true,
        lastName: true,
        isActive: true,
        createdAt: true,
      },
    });

    // Generate tokens
    const token = generateToken({
      userId: user.id,
      email: user.email || undefined,
      phone: user.phone || undefined,
    });

    const refreshToken = generateRefreshToken({
      userId: user.id,
      email: user.email || undefined,
      phone: user.phone || undefined,
    });

    return {
      user,
      token,
      refreshToken,
    };
  }

  async login(data: LoginDto) {
    // Find user
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: data.email || undefined },
          { phone: data.phone || undefined },
        ],
      },
    });

    if (!user) {
      throw new Error('Invalid credentials');
    }

    if (!user.isActive) {
      throw new Error('User account is inactive');
    }

    // Verify password
    const isPasswordValid = await comparePassword(data.password, user.password);

    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    // Generate tokens
    const token = generateToken({
      userId: user.id,
      email: user.email || undefined,
      phone: user.phone || undefined,
    });

    const refreshToken = generateRefreshToken({
      userId: user.id,
      email: user.email || undefined,
      phone: user.phone || undefined,
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        phone: user.phone,
        firstName: user.firstName,
        lastName: user.lastName,
        isActive: user.isActive,
        createdAt: user.createdAt,
      },
      token,
      refreshToken,
    };
  }
}
