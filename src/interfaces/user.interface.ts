import { Scout } from '@models/scout.model';

export interface UserInterface {
    id?: number;
    email: string;
    password: string;
    reset_password_token?: string;
    reset_token_expires?: Date;
    firstname: string;
    lastname: string;
    role: string;
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
export interface SignupRequestInterface {
    email: string;
    password: string;
    firstname: string;
    lastname: string;
    role?: string;
    details?: UserDetailsInterface;
}

export interface EditUserInterface {
    email?: string;
    password?: string;
    firstname?: string;
    lastname?: string;
    details?: UserDetailsInterface;
}

export interface UserTokenResponseInterface {
    token: string;
    profile: UserInterface
}

export interface UserExistsResponseInterface {
    exists: boolean;
}

export interface TokenAuthResponseInterface {
    message: string;
    profile: UserInterface;
}
