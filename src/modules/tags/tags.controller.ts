import { Body, Controller, Delete, Get, HttpCode, Param, Post, Put } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { TagDto } from '../../common/dto/reference.dto';
import { Public } from '../auth/public.decorator';
import { Permissions } from '../auth/permissions.decorator';
import { CatalogRepository } from '../../infrastructure/database/repositories/catalog.repository';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';

@ApiTags('Tags')
@ApiBearerAuth('jwt')
@Controller('tags')
export class TagsController {
  constructor(private readonly catalog: CatalogRepository) {}

  @Get()
  @Public()
  @ApiOkResponse({ type: [TagDto] })
  findAll() {
    return this.catalog.findTags();
  }

  @Post()
  @Permissions('users.permissions.manage')
  @ApiCreatedResponse({ type: TagDto })
  create(@Body() input: CreateTagDto) {
    return this.catalog.createTag(input);
  }

  @Put(':id')
  @Permissions('users.permissions.manage')
  @ApiOkResponse({ type: TagDto })
  update(@Param('id') id: string, @Body() input: UpdateTagDto) {
    return this.catalog.updateTag(id, input);
  }

  @Delete(':id')
  @Permissions('users.permissions.manage')
  @HttpCode(204)
  @ApiNoContentResponse()
  delete(@Param('id') id: string) {
    return this.catalog.deleteTag(id);
  }
}
