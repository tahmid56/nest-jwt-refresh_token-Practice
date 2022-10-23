import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuthDto } from './dto';
import * as bcrypt from 'bcrypt';
import { Tokens } from './types';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private jwtService: JwtService
        ){}

    hashData(data:string){
        return bcrypt.hash(data, 10);
    }

    async getTokens(userId: number): Promise<Tokens>{
        const [at, rt] = await Promise.all([
            this.jwtService.signAsync({
                sub: userId
            },{
                secret: 'at-secret',
                expiresIn: 60 * 15
            }
            ),
            this.jwtService.signAsync({
                sub: userId
            },{
                secret: 'rt-secret',
                expiresIn: 60 * 60 * 24 * 7,
            }
            )
        ]);
        return {
            access_token: at,
            refresh_token: rt
        }
    }

    async updateRt(userId: number, rt: string){
        const hash = await this.hashData(rt)
        await this.prisma.user.update({
            where:{
                id: userId
            },
            data:{
                hashedRt: hash
            }
        })
    }

    async signupLocal(dto:AuthDto): Promise<Tokens>{
        const hash = await this.hashData(dto.password);
        const newUser = this.prisma.user.create({
            data:{
                email: dto.email,
                hash
            }
        });
        const tokens = await this.getTokens((await newUser).id);
        await this.updateRt((await newUser).id, tokens.refresh_token);
        return tokens;
    }

    async signinLocal(dto: AuthDto): Promise<Tokens>{
        const user = await this.prisma.user.findUnique({
            where:{
                email:dto.email,
            }
        });
        if(!user) throw new ForbiddenException("Access Denied");

        const passwordMatches = await bcrypt.compare(dto.password, user.hash);
        if(!passwordMatches) throw new ForbiddenException("Access Denied");

        const tokens = await this.getTokens(user.id);
        await this.updateRt(user.id, tokens.refresh_token);
        return tokens;
    }

    async logout(userId: number){
        await this.prisma.user.updateMany({
            where:{
                id: userId,
                hashedRt:{
                    not: null,
                },
            },
                data:{
                    hashedRt: null
                }
            },
        )
    }

    async refreshToken(userid:number, rt: string){
        const user = await this.prisma.user.findUnique({
            where:{
                id: userid
            }
        })

        if(!user) throw new ForbiddenException("Access Denied");

        const rtMatches = bcrypt.compare(rt, user.hashedRt);
        if(!rtMatches) throw new ForbiddenException("Access Denied");
    }
}
