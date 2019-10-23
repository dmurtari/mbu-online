import { BadgeInterface, BadgeDto } from '@interfaces/badge.interface';
import { OfferingInterface, OfferingDto } from '@interfaces/offering.interface';
import { ScoutInterface } from '@interfaces/scout.interface';
import { RegistrationPurchasesDto, AssignmentRegistrationDto } from '@interfaces/registration.interface';
import { PurchasableInterface, PurchasableDto } from '@interfaces/purchasable.interface';

export enum Semester {
    SPRING = 'Spring',
    FALL = 'Fall'
}

export interface EventInterface {
    id?: number;
    year?: number;
    semester?: Semester;
    date?: Date;
    registration_open?: Date;
    registration_close?: Date;
    price?: number;
    offerings?: BadgeInterface[];
    purchasables?: PurchasableInterface[];
}

export interface EventDto<T = any, K = any> extends EventInterface {
    event_id?: number;
    purchasables?: PurchasableDto[];
    details?: T;
    offerings?: BadgeDto<K>[];
}

export interface EventOfferingInterface extends EventInterface {
    offerings?: BadgeDto<OfferingInterface>[];
}

export interface CurrentEventInterface {
    event_id?: string;
    event?: EventInterface;
}

export interface EventResponseDto {
    message: string;
    event: EventInterface;
}

export interface CreateOfferingResponseDto {
    message: string;
    event: EventOfferingInterface;
}

export interface CurrentEventResponseDto {
    message: string;
    currentEvent: EventInterface;
}

export interface IncomeCalculationResponseDto {
    income: string;
}

export interface AssigneeDto extends OfferingDto {
    badge?: BadgeDto;
    assignees?: AssignmentRegistrationDto[];
}

export type AssigneesResponseDto = AssigneeDto[];

export type EventCreateDto = EventInterface;

export type EventsResponseDto = EventDto<undefined, OfferingDto>[];

export type GetCurrentEventDto = EventInterface;

export interface SetCurrentEventDto {
    id: string|number;
}

export interface EventStatisticsDto {
    scouts?: ScoutInterface[];
    offerings?: BadgeDto[];
    registrations?: RegistrationPurchasesDto[];
}

export interface ClassSizeDto {
    size_limit: number;
    total: number;
    1: number;
    2: number;
    3: number;
}
