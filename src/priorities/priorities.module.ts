import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PrioritiesService } from './priorities.service';
import { PrioritiesController } from './priorities.controller';
import { Priority } from './priorities.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Priority]) // ✅ OBLIGATOIRE
  ],
  controllers: [PrioritiesController],
  providers: [PrioritiesService],
  exports: [TypeOrmModule], // optionnel mais propre
})
export class PrioritiesModule {}
