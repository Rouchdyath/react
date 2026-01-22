import { Controller, Get, Post, Body, Query, UseGuards, Req } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';

@Controller('comments')
export class CommentsController {
  constructor(private service: CommentsService) {}

  @Get()
  getComments(@Query('ticketId') ticketId?: string) {
    if (ticketId) {
      return this.service.findByTicket(+ticketId);
    }
    return this.service.findAll();
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  createComment(@Body() data: any, @Req() req: any) {
    console.log('💬 Création commentaire, user:', req.user);
    
    const commentData = {
      message: data.message,
      ticket: data.ticket,
      user: { id: req.user.id } as any, // ← Ajoute "as any"
    };
    
    return this.service.create(commentData);
  }
}