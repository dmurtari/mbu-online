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
