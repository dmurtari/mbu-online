import { BadgeInterface, BadgeDto } from '@interfaces/badge.interface';
import { Purchasable } from '@models/purchasable.model';
import { OfferingInterface } from '@interfaces/offering.interface';

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
    purchasables?: Purchasable[];
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

export interface IncomeCalculationResponseInterface {
    income: string;
}

export type EventCreateDto = EventInterface;

export type EventsResponseDto = EventInterface[];

export type GetCurrentEventDto = EventInterface;

export interface SetCurrentEventDto {
    id: string|number;
}
