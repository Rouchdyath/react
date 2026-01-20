import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './users.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  findAll() {
    return this.usersRepository.find();
  }

  create(data: Partial<User>) {
    return this.usersRepository.save(data);
  }
  findByEmail(email: string) {
  return this.usersRepository.findOne({ where: { email } });
}
}