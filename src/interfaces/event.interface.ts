import { BadgeInterface, BadgeDto } from '@interfaces/badge.interface';
import { OfferingInterface } from '@interfaces/offering.interface';
import { ScoutInterface } from '@interfaces/scout.interface';
import { RegistrationPurchaseDto } from '@interfaces/registration.interface';
import { PurchasableInterface } from '@interfaces/purchasable.interface';

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

export interface EventDto<T = any> extends EventInterface {
    event_id?: number;
    details: T;
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

export type EventCreateDto = EventInterface;

export type EventsResponseDto = EventInterface[];

export type GetCurrentEventDto = EventInterface;

export interface SetCurrentEventDto {
    id: string|number;
}

export interface EventStatisticsDto {
    scouts?: ScoutInterface[];
    offerings?: BadgeDto[];
    registrations?: RegistrationPurchaseDto[]
}
