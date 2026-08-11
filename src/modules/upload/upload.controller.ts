import {
  Controller,
  Delete,
  FileTypeValidator,
  Get,
  HttpCode,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { User } from '../../common/types/domain';
import { CurrentUser } from '../auth/current-user.decorator';
import { Permissions } from '../auth/permissions.decorator';
import { MediaAssetDto } from './dto/media-asset.dto';
import { UploadService } from './upload.service';

@ApiTags('Upload')
@ApiBearerAuth('jwt')
@Controller('upload')
export class UploadController {
  constructor(private readonly upload: UploadService) {}

  @Post('images')
  @Permissions('media.upload')
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: 10_000_000 } }))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['file'],
      properties: { file: { type: 'string', format: 'binary' } },
    },
  })
  @ApiCreatedResponse({ type: MediaAssetDto })
  uploadImage(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 10_000_000 }),
          new FileTypeValidator({ fileType: /^image\/(jpeg|png|webp|gif)$/ }),
        ],
      }),
    )
    file: Express.Multer.File,
    @CurrentUser() user: User,
  ) {
    return this.upload.uploadImage(file, user);
  }

  @Get('media')
  @Permissions('media.view')
  @ApiOkResponse({ type: [MediaAssetDto] })
  findAll() {
    return this.upload.findAll();
  }

  @Delete('media/:id')
  @Permissions('media.delete')
  @HttpCode(204)
  @ApiNoContentResponse()
  deleteImage(@Param('id') id: string, @CurrentUser() user: User) {
    return this.upload.deleteImage(id, user);
  }
}
