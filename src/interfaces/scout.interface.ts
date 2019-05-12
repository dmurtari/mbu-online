import { EventDto } from '@interfaces/event.interface';
import { RegistrationDto } from '@interfaces/registration.interface';

export interface ScoutInterface {
    id?: number;
    firstname?: string;
    lastname?: string;
    birthday?: Date;
    troop?: number;
    notes?: string;
    emergency_name?: string;
    emergency_relation?: string;
    emergency_phone?: string;
    registrations?: any[];
}

export type ScoutRequestDto = ScoutInterface;

export interface ScoutRegistrationDto extends ScoutInterface {
    registrations: EventDto<RegistrationDto>[];
}

export type ScoutRegistrationResponseDto = ScoutRegistrationDto[];

export interface ScoutResponseDto {
    message: string;
    scout: ScoutInterface;
}
