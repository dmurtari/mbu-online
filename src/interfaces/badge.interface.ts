export interface BadgeInterface<K = any> {
    id?: number;
    name?: string;
    description?: string;
    notes?: string;
    details?: K;
}

export interface BadgeResponseInterface {
    message: string;
    badge: BadgeInterface;
}
