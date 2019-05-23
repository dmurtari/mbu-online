import { OfferingInterface, OfferingDto } from '@interfaces/offering.interface';
import { PreferenceInterface } from '@interfaces/preference.interface';
import { PurchasableDto } from '@interfaces/purchasable.interface';
import { PurchaseInterface } from '@interfaces/purchase.interface';

export interface RegistrationInterface {
    id?: number;
    event_id?: number;
    scout_id?: number;
    notes?: string;
    preferences?: OfferingInterface[];
    assignments?: OfferingInterface[];
}

export interface RegistrationDto extends RegistrationInterface {
    event_id?: number;
}

export interface RegistrationPreferenceDto extends RegistrationDto {
    preferences: OfferingDto<PreferenceInterface>[];
}

export interface RegistrationPurchaseDto extends RegistrationDto {
    purchases?: PurchasableDto<PurchaseInterface>[];
}

export interface CreateRegistrationResponseDto {
    message: string;
    registration: RegistrationDto;
}

export interface RegistrationRequestDto {
    event_id?: string;
    notes?: string;
}

export interface CostCalculationResponseInterface {
    cost: string;
}

export type RegistrationsResponseDto = RegistrationDto[];
