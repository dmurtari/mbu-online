import { BadgeInterface } from '@interfaces/badge.interface';
import { Purchasable } from '@models/purchasable.model';
import { OfferingInterface } from '@interfaces/offering.interface';

export enum Semester {
    SPRING = 'Spring',
    FALL = 'Fall'
}

export interface EventInterface {
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
    offerings?: BadgeInterface<OfferingInterface>[];
}

export interface CurrentEventInterface {
    event_id?: string;
    event?: EventInterface;
}

export interface EventResponseInterface {
    message: string;
    event: EventInterface;
}

export interface CurrentEventResponseInterface {
    message: string;
    currentEvent: EventInterface;
}
