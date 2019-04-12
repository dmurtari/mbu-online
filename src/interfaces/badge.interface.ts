export interface BadgeInterface {
    id?: number;
    name?: string;
    description?: string;
    notes?: string;
}

export interface BadgeResponseInterface {
    message: string;
    badge: BadgeInterface;
}
