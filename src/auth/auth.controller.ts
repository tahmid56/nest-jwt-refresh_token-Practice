import { Body, Controller, HttpCode, HttpStatus, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthDto } from './dto';
import { Tokens } from './types';
import {Request} from 'express';
@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService){}

    @Post('/signup')
    @HttpCode(HttpStatus.CREATED)
    signupLocal(@Body() dto:AuthDto): Promise<Tokens>{
        return this.authService.signupLocal(dto);
    }

    @Post('/signin')
    @HttpCode(HttpStatus.OK)
    signinLocal(@Body() dto:AuthDto): Promise<Tokens>{
        return this.authService.signinLocal(dto);
    }

    @UseGuards(AuthGuard('jwt'))
    @Post('/logout')
    @HttpCode(HttpStatus.OK)
    logout(@Req() req: Request){
        
        const user = req.user;

       return this.authService.logout(user['sub']);
    }

    @UseGuards(AuthGuard('jwt-refresh'))
    @Post('/refresh')
    @HttpCode(HttpStatus.OK)
    refreshTokens(@Req() req: Request){
        const user = req.user;
       return this.authService.refreshToken(user['sub'], user['refreshToken']);
    }
}
