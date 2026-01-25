import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(name: string, email: string, password: string, role: 'client' | 'agent' | 'admin' = 'client') {
    // Ne pas hasher ici, le UsersService.create() le fait déjà
    const user = await this.usersService.create({
      name,
      email,
      password, // Passer le mot de passe en clair, UsersService le hashera
      role,
    });

    // Ne pas retourner le mot de passe
    const { password: _, ...result } = user;
    return result;
  }

  async login(email: string, password: string) {
    console.log('🔍 Tentative de login avec:', email);
    
    const user = await this.usersService.findByEmail(email);
    console.log('👤 Utilisateur trouvé:', user ? 'Oui' : 'Non');

    if (!user) {
      throw new UnauthorizedException('Email ou mot de passe incorrect');
    }

    console.log('🔑 Password fourni:', password);
    console.log('🔒 Hash en base:', user.password);

    const isPasswordValid = await bcrypt.compare(password, user.password);
    console.log('✅ Mot de passe valide:', isPasswordValid);
    
    if (!isPasswordValid) {
      throw new UnauthorizedException('Email ou mot de passe incorrect');
    }

    const payload = {
      sub: user.id,
      role: user.role,
      email: user.email,
      name: user.name,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }

  async validateUser(userId: number) {
    return this.usersService.findOne(userId);
  }
}