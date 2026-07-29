import { Controller, Get } from '@nestjs/common';
import { Public } from '../auth/public.decorator';
import { CatalogRepository } from '../../infrastructure/database/repositories/catalog.repository';

@Public()
@Controller('tags')
export class TagsController {
  constructor(private readonly catalog: CatalogRepository) {}

  @Get()
  findAll() {
    return this.catalog.findTags();
  }
}
