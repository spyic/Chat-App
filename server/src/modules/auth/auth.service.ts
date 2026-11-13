import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../../config/database';
import { env } from '../../config/env';
import { BadRequestError, UnauthorizedError, ConflictError } from '../../utils/errors';
import { SafeUser } from '../../types';
import { RegisterInput, LoginInput } from './auth.schema';

const SALT_ROUNDS = 12;
const ACCESS_TOKEN_EXPIRY = '24h';

function generateAccessToken(userId: string, email: string): string {
  return jwt.sign({ userId, email }, env.JWT_ACCESS_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRY,
  });
}

function toSafeUser(user: any): SafeUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    avatarUrl: user.avatarUrl,
    isActive: user.isActive,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

export const authService = {
  async register(input: RegisterInput): Promise<{ token: string; user: SafeUser }> {
    const existing = await prisma.user.findUnique({
      where: { email: input.email },
    });

    if (existing) {
      throw new ConflictError('Email already registered');
    }

    const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);

    const user = await prisma.user.create({
      data: {
        name: input.name,
        email: input.email,
        passwordHash,
      },
    });

    const token = generateAccessToken(user.id, user.email);
    return { token, user: toSafeUser(user) };
  },

  async login(input: LoginInput): Promise<{ token: string; user: SafeUser }> {
    const user = await prisma.user.findUnique({
      where: { email: input.email },
    });

    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const isValid = await bcrypt.compare(input.password, user.passwordHash);
    if (!isValid) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const token = generateAccessToken(user.id, user.email);
    return { token, user: toSafeUser(user) };
  },

  async getMe(userId: string): Promise<SafeUser> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new BadRequestError('User not found');
    }

    return toSafeUser(user);
  },
};

