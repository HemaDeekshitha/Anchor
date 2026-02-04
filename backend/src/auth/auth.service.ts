import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { comparePasswords, hashPassword } from './password.util';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/user.entity';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
    private jwtService: JwtService,
  ) {}
  async signup(dto: SignupDto) {
    // 1️⃣ Hash the password
    const hashedPassword = await hashPassword(dto.password);

    const user = this.userRepo.create({
      name: dto.name,
      email: dto.email,
      password: hashedPassword,
    });

    await this.userRepo.save(user);

    // 2️⃣ Save user to DB (later)
    // email, name, hashedPassword

    return { message: 'User created successfully' };
  }

  async login(dto: LoginDto) {
    // 1️⃣ Find user by email (later)
    const user = await this.userRepo.findOne({
      where: { email: dto.email },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }
    console.log('Setting cookies for user:', user.id);

    // 2️⃣ Compare passwords
    const isMatch = await comparePasswords(dto.password, user.password);

    if (!isMatch) {
      throw new UnauthorizedException('Incorrect Password');
    }
    const payload = { sub: user.id, email: user.email };
    console.log('JWT_ACCESS_SECRET:', process.env.JWT_ACCESS_SECRET);

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: '15m',
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_REFRESH_SECRET,
      expiresIn: '7d',
    });

    // ✅ Service returns DATA only
    return { accessToken, refreshToken };
  }
}
