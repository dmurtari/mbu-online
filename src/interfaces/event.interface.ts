import { BadgeInterface } from '@interfaces/badge.interface';
import { Offering } from '@models/offering.model';

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
}

export interface EventOfferingInterface extends EventInterface {
    offerings?: BadgeInterface<Offering>[];
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
