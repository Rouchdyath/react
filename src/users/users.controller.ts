import { Controller,Get, Post, Body } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
    constructor(private service: UsersService){}

    @Get()
    getUsers(){
        return this.service.findAll();
    }
    @Post()
    createUser(@Body() data){
        return this.service.create(data);
    }
}
