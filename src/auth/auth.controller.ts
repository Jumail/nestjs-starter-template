import { Controller, Get, UseGuards, Request, Body, Delete } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { LocalAuthGuard } from './local-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Get('login')
  async login(
    @Request() req,
    @Body() data: { ipAddress: string; device: string },
  ) {
    return this.authService.login(req.user, data);
  }

  @UseGuards(JwtAuthGuard)
  @Get('protected')
  getProtected(@Request() req) {
    return req.user;
  }

  @Get('refresh')
  async refresh(@Body() data: { refresh_token: string, ipAddress: string, device:string }) {
    return this.authService.refresh(data.refresh_token, data);
  }

  @Delete('revoke')
  async delete(@Body() data: {refresh_token: string}) {
    return this.authService.revokeToken(data.refresh_token);
  }
}
