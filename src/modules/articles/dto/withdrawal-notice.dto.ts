import { ApiProperty } from '@nestjs/swagger';

export class WithdrawalNoticeDto {
  @ApiProperty() title!: string;
  @ApiProperty() slug!: string;
  @ApiProperty() reason!: string;
  @ApiProperty({ format: 'date-time' }) withdrawnAt!: string;
}
