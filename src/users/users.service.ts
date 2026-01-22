import { Injectable } from '@nestjs/common';
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
}
