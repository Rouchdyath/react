import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from './comments.entity';

@Injectable()
export class CommentsService {
    constructor(
        @InjectRepository(Comment)
        private repo:Repository<Comment>

    ){}
    finAll(){
        return this.repo.find();
    }
    create(data :Partial<Comment>){
        const  comments = this.repo.create(data);
        return this.repo.save(comments);
    }
}
