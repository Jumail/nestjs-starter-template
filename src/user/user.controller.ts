import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  create(@Body() createUserInput: Prisma.UserCreateInput) {
    return this.userService.createUser(createUserInput);
  }

  @Post('login')
  login(@Body() data: { phone: string; password: string }) {
    console.log(data);
  }

  @Get()
  findAll() {
    return this.userService.user({});
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.user({ id: id });
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() userUpdateInput: Prisma.UserUpdateInput,
  ) {
    return this.userService.updateUser({
      where: { id: id },
      data: userUpdateInput,
    });
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.deleteUser({ id });
  }
}
