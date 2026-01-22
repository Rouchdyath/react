import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.get<string[]>('roles', context.getHandler());

    if (!roles) {
      return true; // Pas de rôle requis
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    console.log('🔒 Rôles requis:', roles);
    console.log('👤 Rôle utilisateur:', user?.role);

    if (!user || !user.role) {
      return false;
    }

    return roles.includes(user.role);
  }
}