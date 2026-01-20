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
    return this.priorityRepository.find();
  }

  create(data: Partial<Priority>) {
    return this.priorityRepository.save(data);
  }
}
