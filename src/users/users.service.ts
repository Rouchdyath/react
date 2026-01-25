import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './users.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  findAll() {
    return this.usersRepository.find();
  }

  findOne(id: number) {
    return this.usersRepository.findOne({ where: { id } });
  }

  async create(data: Partial<User>) {
    // Hash le mot de passe avant de sauvegarder
    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10);
    }
    return this.usersRepository.save(data);
  }

  findByEmail(email: string) {
    return this.usersRepository.findOne({ where: { email } });
  }

  async update(id: number, data: Partial<User>) {
    // Hash le mot de passe si on le modifie
    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10);
    }
    await this.usersRepository.update(id, data);
    return this.findOne(id);
  }

  async delete(id: number) {
    return this.usersRepository.delete(id);
  }

  // 🔹 Méthodes pour l'admin dashboard
  async updateUser(id: number, data: any) {
    const user = await this.findOne(id);
    if (!user) {
      throw new NotFoundException('Utilisateur introuvable');
    }

    // Valider le rôle si fourni
    if (data.role && !['client', 'agent', 'admin'].includes(data.role)) {
      throw new BadRequestException('Rôle invalide. Rôles valides: client, agent, admin');
    }

    // Mettre à jour l'utilisateur
    await this.usersRepository.update(id, data);
    return this.findOne(id);
  }

  async deleteUser(id: number) {
    const user = await this.findOne(id);
    if (!user) {
      throw new NotFoundException('Utilisateur introuvable');
    }

    // Empêcher la suppression du dernier admin
    if (user.role === 'admin') {
      const adminCount = await this.usersRepository.count({ where: { role: 'admin' } });
      if (adminCount <= 1) {
        throw new BadRequestException('Impossible de supprimer le dernier administrateur');
      }
    }

    await this.usersRepository.delete(id);
    return { message: 'Utilisateur supprimé avec succès' };
  }
}
