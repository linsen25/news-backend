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
import { JwtService } from '@nestjs/jwt';
import { ApproveArticleDto } from './dto/approve-article.dto';
import { WithdrawArticleDto } from './dto/withdraw-article.dto';
import { WithdrawalNoticeDto } from './dto/withdrawal-notice.dto';
import { ArticleViewCountDto, RecordArticleViewDto } from './dto/record-article-view.dto';

@ApiTags('Articles', 'Review')
@ApiBearerAuth('jwt')
@Controller('articles')
export class ArticlesController {
  constructor(
    private readonly articlesService: ArticlesService,
    private readonly jwt: JwtService,
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

  @Post('public/slug/:slug/view')
  @Public()
  @HttpCode(200)
  @ApiOperation({ summary: 'Record a public article view with a 30-minute visitor deduplication window' })
  @ApiOkResponse({ type: ArticleViewCountDto })
  recordPublicView(@Param('slug') slug: string, @Body() input: RecordArticleViewDto) {
    return this.articlesService.recordPublicView(slug, input.visitorId);
  }

  @Get('public/withdrawn/slug/:slug')
  @Public()
  @ApiOperation({ summary: 'Get a public withdrawal notice without exposing article content' })
  @ApiOkResponse({ type: WithdrawalNoticeDto })
  findWithdrawalBySlug(@Param('slug') slug: string) {
    return this.articlesService.findWithdrawalBySlug(slug);
  }

  @Get(':id/preview')
  @Public()
  @ApiOperation({ summary: 'Preview draft or unpublished article' })
  @ApiOkResponse({ type: ArticleDto })
  async preview(@Param('id') id: string, @Query('token') token?: string) {
    if (!token) {
      throw new UnauthorizedException('Invalid preview token');
    }
    try {
      const payload = await this.jwt.verifyAsync<{
        articleId?: string;
        purpose?: string;
      }>(token);
      if (payload.articleId !== id || payload.purpose !== 'article-preview') {
        throw new UnauthorizedException('Invalid preview token');
      }
    } catch {
      throw new UnauthorizedException('Preview token expired or invalid');
    }
    return this.articlesService.findOne(id);
  }

  @Post(':id/preview-token')
  @HttpCode(200)
  @ApiOperation({ summary: 'Create a short-lived preview token for one article' })
  async createPreviewToken(
    @Param('id') id: string,
    @CurrentUser() user: User,
  ) {
    await this.articlesService.findOne(id, user);
    return {
      token: await this.jwt.signAsync(
        { sub: user.id, articleId: id, purpose: 'article-preview' },
        { expiresIn: '15m' },
      ),
      expiresIn: 900,
    };
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
    @Body() input: ApproveArticleDto,
    @CurrentUser() user: User,
  ) {
    return this.articlesService.approve(id, user, input?.comment?.trim());
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

  @Post(':id/withdraw')
  @HttpCode(200)
  @Permissions('articles.withdraw')
  @ApiOperation({ summary: 'Withdraw a publicly visible article' })
  @ApiOkResponse({ type: ArticleDto })
  withdraw(@Param('id') id: string, @Body() input: WithdrawArticleDto, @CurrentUser() user: User) {
    return this.articlesService.withdraw(id, user, input.reason.trim());
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
