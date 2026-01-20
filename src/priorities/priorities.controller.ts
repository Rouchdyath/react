
import { Controller,Get, Post, Body } from '@nestjs/common';
import { PrioritiesService } from './priorities.service';


@Controller('priorities')
export class PrioritiesController {
        constructor(private service: PrioritiesService){}

    @Get()
    getPriorities(){
        return this.service.findAll();
    }
    @Post()
    createPriorities(@Body() data){
        return this.service.create(data);
    }
}


    


