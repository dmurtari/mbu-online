import { RegistrationPreferenceDto } from '@interfaces/registration.interface';
import { OfferingDto } from '@interfaces/offering.interface';

export interface PreferenceInterface {
    rank?: number;
    offering_id?: number;
    registration_id?: number;
}

export interface PreferenceRequestDto {
    rank: number;
    offering: number;
}

export interface UpdatePreferenceRequestDto {
    rank: number;
}

export interface CreatePreferenceResponseDto {
    message: string;
    registration: RegistrationPreferenceDto;
}

export interface UpdatePreferenceResponseDto {
    preference: PreferenceInterface;
    message: string;
}

export type AllPreferenceResponseDto = OfferingDto<PreferenceInterface>[];
