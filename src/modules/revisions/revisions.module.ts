import { Module } from '@nestjs/common';
import { RevisionsController } from './revisions.controller';

@Module({ controllers: [RevisionsController] })
export class RevisionsModule {}
