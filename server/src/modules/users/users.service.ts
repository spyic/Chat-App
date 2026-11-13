import { prisma } from '../../config/database';
import { SafeUser } from '../../types';
import { NotFoundError } from '../../utils/errors';

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

export const usersService = {
  async getAllUsers(excludeUserId: string): Promise<SafeUser[]> {
    const users = await prisma.user.findMany({
      where: { id: { not: excludeUserId }, isActive: true },
      orderBy: { name: 'asc' },
    });
    return users.map(toSafeUser);
  },

  async searchUsers(query: string, excludeUserId: string): Promise<SafeUser[]> {
    const users = await prisma.user.findMany({
      where: {
        id: { not: excludeUserId },
        isActive: true,
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { email: { contains: query, mode: 'insensitive' } },
        ],
      },
      orderBy: { name: 'asc' },
      take: 20,
    });
    return users.map(toSafeUser);
  },

  async getUserById(userId: string): Promise<SafeUser> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundError('User');
    }

    return toSafeUser(user);
  },
};

