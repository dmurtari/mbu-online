import { EventDto, EventInterface } from '@interfaces/event.interface';
import { RegistrationDto } from '@interfaces/registration.interface';
import { UserInterface, ScoutUserDto } from '@interfaces/user.interface';

export interface ScoutInterface {
    id?: number;
    firstname?: string;
    lastname?: string;
    fullname?: string;
    birthday?: Date;
    troop?: number;
    notes?: string;
    emergency_name?: string;
    emergency_relation?: string;
    emergency_phone?: string;
    user?: UserInterface;
    registrations?: EventInterface[];
}

export interface ScoutDto extends ScoutInterface {
    scout_id?: number;
    user?: ScoutUserDto;
    registrations?: EventDto<RegistrationDto>[];
}

export type ScoutsResponseDto = ScoutDto[];

export type CreateScoutRequestDto = ScoutDto;

export interface ScoutRegistrationDto extends ScoutDto {
    registrations: EventDto<RegistrationDto>[];
}

export type ScoutRegistrationResponseDto = ScoutRegistrationDto[];

export interface ScoutResponseDto {
    message: string;
    scout: ScoutDto;
}
