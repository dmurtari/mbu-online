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
