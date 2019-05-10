export interface BadgeInterface {
    id?: number;
    name?: string;
    description?: string;
    notes?: string;
}

export interface BadgeDto<K = any> extends BadgeInterface {
    details?: K;
}

export interface BadgeResponseDto {
    message: string;
    badge: BadgeInterface;
}

export type CreateUpdateBadgeDto = BadgeInterface;

export type BadgesResponseDto = BadgeInterface[];
