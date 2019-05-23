import { OfferingInterface, OfferingDto } from '@interfaces/offering.interface';
import { Preference } from '@models/preference.model';
import { PreferenceInterface } from '@interfaces/preference.interface';

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
