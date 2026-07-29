import { ApiProperty } from '@nestjs/swagger';
import { EntityReferenceDto } from '../../../common/dto/reference.dto';

export class MediaAssetDto {
  @ApiProperty({ example: 'media-001' })
  id!: string;

  @ApiProperty({ example: 'https://res.cloudinary.com/demo/image/upload/example.jpg' })
  url!: string;

  @ApiProperty({ example: 'news-platform/example' })
  publicId!: string;

  @ApiProperty({ example: 'press-conference.jpg' })
  filename!: string;

  @ApiProperty({ example: 'image/jpeg' })
  mimeType!: string;

  @ApiProperty({ example: 245760 })
  size!: number;

  @ApiProperty({ type: EntityReferenceDto })
  uploadedBy!: EntityReferenceDto;

  @ApiProperty({ format: 'date-time' })
  createdAt!: string;

  @ApiProperty({ example: 2 })
  referenceCount!: number;
}
