import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { RegisterDto } from './dto/register.dto';
import * as bcryptjs from 'bcryptjs';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register({ email, password, name }: RegisterDto) {
    const user = await this.userService.findOneByEmail(email);
    if (user) {
      throw new BadRequestException('Email already exists');
    }
    return await this.userService.create({
      email,
      password: await bcryptjs.hash(password, 10),
      name,
    });
  }

  async login({ email, password }: LoginDto) {
    const user = await this.userService.findOneByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }
    const isPasswordCorrect = await bcryptjs.compare(password, user.password);
    if (!isPasswordCorrect) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const payload = { email: user.email };

    const token = await this.jwtService.signAsync(payload);

    return { token, email };
  }
}
