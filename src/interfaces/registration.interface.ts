import { OfferingInterface } from '@interfaces/offering.interface';

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
