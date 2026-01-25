import { Controller, Get, Post, Body, Patch, Delete, Param, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { RolesGuard } from '../auth/guard/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
    constructor(private service: UsersService){}

    @Get()
    @Roles('admin', 'agent')
    getUsers(){
        return this.service.findAll();
    }

    @Post()
    @Roles('admin')
    createUser(@Body() data){
        return this.service.create(data);
    }

    @Patch(':id')
    @Roles('admin')
    async updateUser(@Param('id') id: string, @Body() data: any) {
        return this.service.updateUser(parseInt(id), data);
    }

    @Delete(':id')
    @Roles('admin')
    async deleteUser(@Param('id') id: string) {
        return this.service.deleteUser(parseInt(id));
    }
}
