export interface OfferingInterface {
    id?: number;
    duration?: number;
    periods?: number[];
    price?: number|string;
    requirements?: string[];
    event_id?: number;
    size_limit?: number;
}

export interface CreateOfferingInterface {
    badge_id: number;
    offering: OfferingInterface;
}

export interface OfferingResponseInterface {
    message: string;
    offering: OfferingInterface;
}
