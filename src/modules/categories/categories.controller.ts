import { Body, Controller, Delete, Get, HttpCode, Param, Post, Put } from '@nestjs/common';
import { ApiBearerAuth, ApiCreatedResponse, ApiNoContentResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { CategoryReferenceDto } from '../../common/dto/reference.dto';
import { Public } from '../auth/public.decorator';
import { Permissions } from '../auth/permissions.decorator';
import { CatalogRepository } from '../../infrastructure/database/repositories/catalog.repository';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@ApiTags('Categories')
@ApiBearerAuth('jwt')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly catalog: CatalogRepository) {}

  @Get()
  @Public()
  @ApiOkResponse({ type: [CategoryReferenceDto] })
  findAll() {
    return this.catalog.findCategories();
  }

  @Post()
  @Permissions('users.permissions.manage')
  @ApiCreatedResponse({ type: CategoryReferenceDto })
  create(@Body() input: CreateCategoryDto) {
    return this.catalog.createCategory(input);
  }

  @Put(':id')
  @Permissions('users.permissions.manage')
  @ApiOkResponse({ type: CategoryReferenceDto })
  update(@Param('id') id: string, @Body() input: UpdateCategoryDto) {
    return this.catalog.updateCategory(id, input);
  }

  @Delete(':id')
  @Permissions('users.permissions.manage')
  @HttpCode(204)
  @ApiNoContentResponse()
  delete(@Param('id') id: string) {
    return this.catalog.deleteCategory(id);
  }
}
