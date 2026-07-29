import { Controller, Get } from '@nestjs/common';
import { AuditService } from './audit.service';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { AuditLogDto } from './dto/audit-log.dto';
import { Permissions } from '../auth/permissions.decorator';

@ApiTags('Audit')
@ApiBearerAuth('jwt')
@Controller('audit-logs')
export class AuditController {
  constructor(private readonly audit: AuditService) {}

  @Get()
  @Permissions('users.view')
  @ApiOkResponse({ type: [AuditLogDto] })
  findAll() {
    return this.audit.findAllDto();
  }
}
