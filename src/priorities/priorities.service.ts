import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Priority } from './priorities.entity';

@Injectable()
export class PrioritiesService {
  constructor(
    @InjectRepository(Priority)
    private readonly priorityRepository: Repository<Priority>,
  ) {}

  findAll() {
    return this.priorityRepository.find({ order: { level: 'ASC' } });
  }

  findOne(id: number) {
    return this.priorityRepository.findOne({ where: { id } });
  }

  create(data: Partial<Priority>) {
    return this.priorityRepository.save(data);
  }

  async update(id: number, data: Partial<Priority>) {
    await this.priorityRepository.update(id, data);
    return this.findOne(id);
  }

  async delete(id: number) {
    return this.priorityRepository.delete(id);
  }
}