import {
  ForbiddenException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';
import { UserService } from 'src/user/user.service';
import * as bcrypt from 'bcrypt';

type Payload = {
  sub: string;
};

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private prisma: PrismaService,
  ) {}

  async validateUser(phone: string, password: string): Promise<any> {
    const user = await this.userService.user({ phone });

    const isMatch = await bcrypt.compare(password, user.password);

    if (user && isMatch === true) {
      const { password, ...result } = user;
      return result;
    }

    return null;
  }

  async login(user: any, data: { ipAddress: string; device: string }) {
    const payload: Payload = { sub: user.id };

    const access_token = this.jwtService.sign(payload);
    const refresh_token = this.jwtService.sign(payload, { expiresIn: '1y' });

    const session = await this.prisma.session.create({
      data: {
        refreshToken: refresh_token,
        userId: user.id,
        ipAddress: data.ipAddress,
        device: data.device,
      },
    });

    if (!session) {
      throw new InternalServerErrorException();
    }

    return { access_token: access_token, refresh_token: refresh_token };
  }

  async refresh(
    refresh_token: string,
    data: { ipAddress: string; device: string },
  ) {
    const session = await this.prisma.session.findUnique({
      where: { refreshToken: refresh_token },
    });

    if (!session) {
      throw new ForbiddenException();
    }

    await this.prisma.session.update({
      where: { id: session.id },
      data: { ipAddress: data.ipAddress, device: data.device },
    });

    const payload: Payload = { sub: session.userId };

    const new_access_token = this.jwtService.sign(payload);

    return {
      access_token: new_access_token,
      refresh_token: refresh_token,
    };
  }

  async revokeToken(refresh_token: string) {
    const session = await this.prisma.session.delete({
      where: { refreshToken: refresh_token },
    });

    if (!session) {
      throw new NotFoundException();
    }

    return session;
  }
}
