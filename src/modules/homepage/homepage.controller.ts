import { Body, Controller, Get, Put } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/current-user.decorator';
import { Permissions } from '../auth/permissions.decorator';
import { Public } from '../auth/public.decorator';
import { User } from '../../common/types/domain';
import { HomepageLayoutDto, UpdateHomepageLayoutDto } from './dto/homepage.dto';
import { HomepageService } from './homepage.service';

@ApiTags('Homepage')
@ApiBearerAuth('jwt')
@Controller('homepage')
export class HomepageController {
  constructor(private readonly homepage: HomepageService) {}

  @Get('public')
  @Public()
  @ApiOkResponse({ type: HomepageLayoutDto })
  findPublic() { return this.homepage.findLayout(true); }

  @Get()
  @Permissions('homepage.view')
  @ApiOkResponse({ type: HomepageLayoutDto })
  findAll() { return this.homepage.findLayout(); }

  @Put()
  @Permissions('homepage.manage')
  @ApiOkResponse({ type: HomepageLayoutDto })
  replace(@Body() input: UpdateHomepageLayoutDto, @CurrentUser() user: User) {
    return this.homepage.replaceLayout(input.slots, user);
  }
}
