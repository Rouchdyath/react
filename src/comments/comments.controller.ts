import { Controller,Get, Post, Body } from '@nestjs/common';
import { CommentsService } from './comments.service';

@Controller('comments')
export class CommentsController {

        constructor(private service: CommentsService){}

    @Get()
    getComment(){
        return this.service.finAll();
    }
    @Post()
    createCommengt(@Body() data){
        return this.service.create(data);
    }
}


    



