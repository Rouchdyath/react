import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: 'mon_super_secret_jwt_123456', // ← Même secret fixe
    });
  }

  async validate(payload: any) {
    console.log('🔍 JWT STRATEGY - validate() appelée !');
    console.log('📦 Payload:', payload);
    
    if (!payload) {
      throw new UnauthorizedException();
    }
    
    const user = { 
      id: payload.sub, 
      sub: payload.sub,
      email: payload.email,
      role: payload.role,
      name: payload.name
    };
    
    console.log('✅ User validé:', user);
    return user;
  }
}