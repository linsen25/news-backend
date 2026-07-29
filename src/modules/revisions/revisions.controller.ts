import { Controller, Get, Param } from '@nestjs/common';
import { RevisionsRepository } from '../../infrastructure/database/repositories/revisions.repository';

@Controller('revisions')
export class RevisionsController {
  constructor(private readonly revisions: RevisionsRepository) {}

  @Get('article/:articleId')
  findByArticle(@Param('articleId') articleId: string) {
    return this.revisions.findByArticle(articleId);
  }
}
