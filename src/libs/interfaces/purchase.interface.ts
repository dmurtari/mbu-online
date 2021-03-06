import { RegistrationPurchasesDto } from '@interfaces/registration.interface';
import { PurchasableDto } from '@interfaces/purchasable.interface';

export enum Size {
    XS = 'xs',
    S = 's',
    M = 'm',
    L = 'l',
    XL = 'xl',
    XXL = 'xxl'
}

export interface PurchaseInterface {
    quantity?: number;
    size?: Size;
    purchasable_id?: number;
    registration_id?: number;
}

export interface CreatePurchaseRequestDto {
    purchasable?: number;
    quantity?: number;
    size?: Size;
}

export interface CreatePurchaseResponseDto {
    message: string;
    registration: RegistrationPurchasesDto;
}

export interface PurchaseResponseInterface {
    purchase?: PurchaseInterface;
    message?: string;
}

export type ScoutPurchasesResponseDto = PurchasableDto<PurchaseInterface>[];

export type BuyersResponseDto = RegistrationPurchasesDto[];
