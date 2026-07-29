import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
  Query,
  UnauthorizedException,
} from '@nestjs/common';
import { ArticlesService } from './articles.service';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { RejectArticleDto } from './dto/reject-article.dto';
import {
  ApiCreatedResponse,
  ApiBearerAuth,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { ArticleDto } from './dto/article.dto';
import { ArticleHistoryDto } from './dto/article-history.dto';
import { CurrentUser } from '../auth/current-user.decorator';
import { Permissions } from '../auth/permissions.decorator';
import { Public } from '../auth/public.decorator';
import { User } from '../../common/types/domain';
import { ArticleQueryDto } from './dto/article-query.dto';
import { ArticlePageDto } from './dto/article-page.dto';

@ApiTags('Articles', 'Review')
@ApiBearerAuth('jwt')
@Controller('articles')
export class ArticlesController {
  constructor(
    private readonly articlesService: ArticlesService,
  ) {}

  @Get()
  @ApiOkResponse({ type: ArticlePageDto })
  findAll(
    @CurrentUser() user: User,
    @Query() query: ArticleQueryDto,
  ) {
    return this.articlesService.findAll(user, query);
  }

  @Get('public')
  @Public()
  @ApiOkResponse({ type: [ArticleDto] })
  findPublished() {
    return this.articlesService.findPublished();
  }

  @Get('public/:id')
  @Public()
  @ApiOkResponse({ type: ArticleDto })
  findPublishedOne(@Param('id') id: string) {
    return this.articlesService.findPublishedOne(id);
  }

  @Get('public/slug/:slug')
  @Public()
  @ApiOkResponse({ type: ArticleDto })
  findPublishedBySlug(@Param('slug') slug: string) {
    return this.articlesService.findPublishedBySlug(slug);
  }

  @Get(':id/preview')
  @Public()
  @ApiOperation({ summary: 'Preview draft or unpublished article' })
  @ApiOkResponse({ type: ArticleDto })
  preview(@Param('id') id: string, @Query('token') token?: string) {
    if (token !== 'mock-preview-token') {
      throw new UnauthorizedException('Invalid preview token');
    }
    return this.articlesService.findOne(id);
  }

  @Get(':id')
  @ApiOkResponse({ type: ArticleDto })
  findOne(
    @Param('id') id: string,
    @CurrentUser() user: User,
  ) {
    return this.articlesService.findOne(id, user);
  }

  @Get(':id/history')
  @ApiOkResponse({ type: ArticleHistoryDto })
  history(
    @Param('id') id: string,
    @CurrentUser() user: User,
  ) {
    return this.articlesService.getHistory(id, user);
  }

  @Post()
  @Permissions('articles.create')
  @ApiCreatedResponse({ type: ArticleDto })
  create(
    @Body() input: CreateArticleDto,
    @CurrentUser() user: User,
  ) {
    return this.articlesService.create(input, user);
  }

  @Put(':id')
  @Permissions('articles.edit.own')
  @ApiOkResponse({ type: ArticleDto })
  update(
    @Param('id') id: string,
    @Body() input: UpdateArticleDto,
    @CurrentUser() user: User,
  ) {
    return this.articlesService.update(id, input, user);
  }

  @Post(':id/submit')
  @HttpCode(200)
  @Permissions('articles.submit')
  @ApiOperation({ summary: 'Submit draft for review' })
  @ApiOkResponse({ type: ArticleDto })
  submit(
    @Param('id') id: string,
    @CurrentUser() user: User,
  ) {
    return this.articlesService.submit(id, user);
  }

  @Post(':id/approve')
  @HttpCode(200)
  @Permissions('articles.review.decide')
  @ApiOperation({ summary: 'Approve article under review' })
  @ApiOkResponse({ type: ArticleDto })
  approve(
    @Param('id') id: string,
    @CurrentUser() user: User,
  ) {
    return this.articlesService.approve(id, user);
  }

  @Post(':id/reject')
  @HttpCode(200)
  @Permissions('articles.review.decide')
  @ApiOperation({ summary: 'Reject article with required review comment' })
  @ApiOkResponse({ type: ArticleDto })
  reject(
    @Param('id') id: string,
    @Body() input: RejectArticleDto,
    @CurrentUser() user: User,
  ) {
    return this.articlesService.reject(id, user, input.comment);
  }

  @Post(':id/publish')
  @HttpCode(200)
  @Permissions('articles.publish')
  @ApiOperation({ summary: 'Publish approved article' })
  @ApiOkResponse({ type: ArticleDto })
  publish(
    @Param('id') id: string,
    @CurrentUser() user: User,
  ) {
    return this.articlesService.publish(id, user);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiNoContentResponse()
  remove(
    @Param('id') id: string,
    @CurrentUser() user: User,
  ) {
    return this.articlesService.remove(id, user);
  }
}
