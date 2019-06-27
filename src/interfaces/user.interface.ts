import { Scout } from '@models/scout.model';

export enum UserRole {
    ADMIN = 'admin',
    COORDINATOR = 'coordinator',
    TEACHER = 'teacher',
    ANONYMOUS = 'anonymous'
}

export interface UserInterface {
    id?: number;
    email: string;
    password: string;
    reset_password_token?: string;
    reset_token_expires?: Date;
    firstname: string;
    lastname: string;
    role: UserRole;
    approved?: boolean;
    details?: UserDetailsInterface;
    scouts?: Scout[];
    fullname?: string;
}

export interface UserDetailsInterface {
    troop?: number;
    district?: string;
    council?: string;
    chapter?: string;
}

export interface ScoutUserDto extends UserInterface {
    user_id?: number;
}

export interface SignupRequestDto {
    email: string;
    password: string;
    firstname: string;
    lastname: string;
    role?: string;
    details?: UserDetailsInterface;
}

export interface EditUserDto {
    email?: string;
    password?: string;
    firstname?: string;
    lastname?: string;
    details?: UserDetailsInterface;
}

export interface EditUserResponseDto {
    message: string;
    profile: UserInterface;
    token?: string;
}

export type UsersResponseDto = UserInterface[];

export interface LoginRequestDto {
    email: string;
    password: string;
}

export interface UserTokenResponseDto {
    token: string;
    profile: UserInterface;
}

export interface UserExistsResponseDto {
    exists: boolean;
}

export interface UserProfileResponseDto {
    message: string;
    profile: UserInterface;
}
