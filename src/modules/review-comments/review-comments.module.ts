import { Module } from '@nestjs/common';
import { ReviewCommentsService } from './review-comments.service';

@Module({
  providers: [ReviewCommentsService],
  exports: [ReviewCommentsService],
})
export class ReviewCommentsModule {}
