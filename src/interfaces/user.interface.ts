import { Scout } from '@models/scout.model';

export interface UserInterface {
    id?: number;
    email: string;
    password: string;
    reset_password_token: string;
    reset_token_expires: Date;
    firstname: string;
    lastname: string;
    role: string;
    approved: boolean;
    details: Object;
    scouts: Scout[];
    fullname: string;
}

export interface SignupRequestInterface {
    email: string;
    password: string;
    firstname: string;
    lastname: string;
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
