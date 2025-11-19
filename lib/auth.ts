// lib/auth.ts
// Authentication helpers for Clerk integration

import { auth, currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { Role } from '@prisma/client';

/**
 * Get current user from Clerk and sync with local database
 * Returns the user from our Prisma database
 */
export async function getCurrentUser() {
  const { userId } = await auth();
  
  if (!userId) {
    return null;
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    return user;
  } catch (error) {
    console.error('Error fetching user from database:', error);
    return null;
  }
}

/**
 * Get current user's Clerk profile
 */
export async function getCurrentClerkUser() {
  return await currentUser();
}

/**
 * Require authentication - throws if user is not logged in
 */
export async function requireAuth() {
  const user = await getCurrentUser();
  
  if (!user) {
    throw new Error('Unauthorized: User must be logged in');
  }
  
  return user;
}

/**
 * Require specific role - throws if user doesn't have the required role
 */
export async function requireRole(requiredRole: Role) {
  const user = await requireAuth();
  
  if (user.role !== requiredRole) {
    throw new Error(`Unauthorized: User must have role ${requiredRole}`);
  }
  
  return user;
}

/**
 * Check if user has a specific role
 */
export async function hasRole(role: Role): Promise<boolean> {
  const user = await getCurrentUser();
  return user?.role === role;
}

/**
 * Check if user is admin
 */
export async function isAdmin(): Promise<boolean> {
  return hasRole(Role.ADMIN);
}

/**
 * Check if user is editor or admin
 */
export async function canEdit(): Promise<boolean> {
  const user = await getCurrentUser();
  return user?.role === Role.ADMIN || user?.role === Role.EDITOR;
}

/**
 * Get user ID from Clerk auth
 */
export async function getUserId(): Promise<string | null> {
  const { userId } = await auth();
  return userId;
}
