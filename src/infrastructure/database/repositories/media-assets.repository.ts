import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { normalizeUploadFilename } from '../../../modules/upload/upload-filename';

const includeUploader = {
  uploadedBy: true,
  _count: { select: { articles: true } },
} as const;

@Injectable()
export class MediaAssetsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(input: {
    id: string;
    url: string;
    publicId: string;
    filename: string;
    mimeType: string;
    size: number;
    uploadedById: string;
  }) {
    const row = await this.prisma.mediaAsset.create({
      data: input,
      include: includeUploader,
    });
    return this.toDto(row);
  }

  findById(id: string) {
    return this.prisma.mediaAsset.findUnique({
      where: { id },
      include: includeUploader,
    });
  }

  async findAll() {
    return (
      await this.prisma.mediaAsset.findMany({
        include: includeUploader,
        orderBy: { createdAt: 'desc' },
      })
    ).map((row) => this.toDto(row));
  }

  async delete(id: string): Promise<void> {
    await this.prisma.mediaAsset.delete({ where: { id } });
  }

  private toDto(row: {
    id: string;
    url: string;
    publicId: string;
    filename: string;
    mimeType: string;
    size: number;
    uploadedBy: { id: string; name: string };
    createdAt: Date;
    _count: { articles: number };
  }) {
    return {
      id: row.id,
      url: row.url,
      publicId: row.publicId,
      filename: normalizeUploadFilename(row.filename),
      mimeType: row.mimeType,
      size: row.size,
      uploadedBy: { id: row.uploadedBy.id, name: row.uploadedBy.name },
      createdAt: row.createdAt.toISOString(),
      referenceCount: row._count.articles,
    };
  }
}
