import { Controller, Get } from '@nestjs/common';
import { Public } from '../auth/public.decorator';
import { CatalogRepository } from '../../infrastructure/database/repositories/catalog.repository';

@Public()
@Controller('categories')
export class CategoriesController {
  constructor(private readonly catalog: CatalogRepository) {}

  @Get()
  findAll() {
    return this.catalog.findCategories();
  }
}
