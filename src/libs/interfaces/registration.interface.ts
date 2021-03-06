import { OfferingInterface, OfferingDto } from '@interfaces/offering.interface';
import { PreferenceInterface } from '@interfaces/preference.interface';
import { PurchasableDto, PurchasableInterface } from '@interfaces/purchasable.interface';
import { PurchaseInterface } from '@interfaces/purchase.interface';
import { AssignmentInterface } from '@interfaces/assignment.interface';
import { ScoutInterface } from '@interfaces/scout.interface';

export interface RegistrationInterface {
    id?: number;
    event_id?: number;
    scout_id?: number;
    notes?: string;
    preferences?: OfferingInterface[];
    assignments?: OfferingInterface[];
    purchases?: PurchasableInterface[];
}

export interface RegistrationDto extends RegistrationInterface {
    event_id?: number;
    scout?: ScoutInterface;
}

export interface RegistrationDetailsDto extends RegistrationDto {
    preferences: OfferingDto<PreferenceInterface>[];
    assignments: OfferingDto<AssignmentInterface>[];
    purchases?: PurchasableDto<PurchaseInterface>[];
}

export interface RegistrationPreferencesDto extends RegistrationDto {
    preferences: OfferingDto<PreferenceInterface>[];
}

export interface RegistrationAssignmentsDto extends RegistrationDto {
    assignments: OfferingDto<AssignmentInterface>[];
}

export interface RegistrationPurchasesDto extends RegistrationDto {
    purchases?: PurchasableDto<PurchaseInterface>[];
}

export interface AssignmentRegistrationDto extends RegistrationDto {
    assignment?: AssignmentInterface;
}

export interface CreateRegistrationResponseDto {
    message: string;
    registration: RegistrationDto;
}

export interface RegistrationRequestDto {
    event_id?: string;
    notes?: string;
}

export interface CostCalculationResponseDto {
    cost: string;
}

export type RegistrationsResponseDto = RegistrationDetailsDto[];
