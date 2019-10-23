import { BadgeInterface } from '@interfaces/badge.interface';
import { RegistrationInterface } from '@interfaces/registration.interface';

export interface OfferingInterface {
    id?: number;
    duration?: number;
    periods?: number[];
    price?: number|string;
    requirements?: string[];
    badge?: BadgeInterface;
    assignees?: RegistrationInterface[];
    event_id?: number;
    badge_id?: number;
    size_limit?: number;
}

export interface OfferingDto<T = any> extends OfferingInterface {
    offering_id?: number;
    details?: T;
}

export interface CreateOfferingDto {
    badge_id: number;
    offering: OfferingInterface;
}

export interface OfferingResponseDto {
    message: string;
    offering: OfferingInterface;
}
