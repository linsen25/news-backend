import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { User } from '../../common/types/domain';
import { MediaAssetsRepository } from '../../infrastructure/database/repositories/media-assets.repository';
import { PermissionsService } from '../auth/permissions.service';
import { CloudinaryService } from './cloudinary.service';

@Injectable()
export class UploadService {
  constructor(
    private readonly cloudinary: CloudinaryService,
    private readonly media: MediaAssetsRepository,
    private readonly permissions: PermissionsService,
  ) {}

  async uploadImage(file: Express.Multer.File, actor: User) {
    const uploaded = await this.cloudinary.uploadImage(file.buffer);
    try {
      return await this.media.create({
        id: randomUUID(),
        url: uploaded.secure_url,
        publicId: uploaded.public_id,
        filename: file.originalname,
        mimeType: file.mimetype,
        size: uploaded.bytes || file.size,
        uploadedById: actor.id,
      });
    } catch (error) {
      await this.cloudinary.deleteImage(uploaded.public_id);
      throw error;
    }
  }

  findAll() {
    return this.media.findAll();
  }

  async deleteImage(id: string, actor: User): Promise<void> {
    const asset = await this.media.findById(id);
    if (!asset) throw new NotFoundException(`Media asset ${id} not found`);
    if (
      asset.uploadedById !== actor.id &&
      !this.permissions.has(actor, 'users.permissions.manage')
    ) {
      throw new ForbiddenException('You can only delete your own media');
    }
    if (asset._count.articles > 0) {
      throw new ConflictException(
        `该图片仍被 ${asset._count.articles} 篇文章使用，无法删除`,
      );
    }
    await this.cloudinary.deleteImage(asset.publicId);
    await this.media.delete(id);
  }
}
