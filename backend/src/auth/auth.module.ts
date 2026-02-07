import { Module } from '@nestjs/common';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/users/user.entity';
import { jwtConstants } from './constants';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './strategies/jwt.strategy';
import { GoogleStrategy } from './strategies/google.strategy';
import { MailService } from 'src/mail/mail.service';

@Module({
  imports: [
    PassportModule,
    PassportModule.register({ session: false }),
    TypeOrmModule.forFeature([User]),
    JwtModule.register({
      secret: jwtConstants.accessTokenSecret,
      signOptions: { expiresIn: '15m' },
    }),
  ],

  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, GoogleStrategy, MailService],
  exports: [PassportModule, JwtModule],
})
export class AuthModule {}
