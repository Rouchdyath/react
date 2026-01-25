import { Controller, Get, Post, Body, Query, UseGuards, Req, Param, Patch, Delete } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { RolesGuard } from '../auth/guard/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('comments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CommentsController {
  constructor(private service: CommentsService) {}

  @Get()
  @Roles('client', 'agent', 'admin')
  getComments(@Query('ticketId') ticketId?: string) {
    if (ticketId) {
      return this.service.findByTicket(+ticketId);
    }
    return this.service.findAll();
  }

  @Post()
  @Roles('client', 'agent', 'admin')
  createComment(@Body() data: any, @Req() req: any) {
    console.log('💬 Création commentaire, user:', req.user);
    
    const commentData = {
      message: data.content || data.message,
      ticket: data.ticket || { id: data.ticketId },
      user: { id: req.user.sub || req.user.id } as any,
      isInternal: data.isInternal || false, // Support des commentaires internes pour les agents
    };
    
    return this.service.create(commentData);
  }

  @Patch(':id')
  @Roles('agent', 'admin')
  updateComment(@Param('id') id: number, @Body() data: { content: string }, @Req() req: any) {
    return this.service.update(+id, data.content, req.user);
  }

  @Delete(':id')
  @Roles('agent', 'admin')
  deleteComment(@Param('id') id: number, @Req() req: any) {
    return this.service.delete(+id, req.user);
  }
}