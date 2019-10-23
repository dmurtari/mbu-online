export interface PurchasableInterface {
    id?: number;
    item?: string;
    description?: string;
    has_size?: boolean;
    price?: number|string;
    maximum_age?: number;
    minimum_age?: number;
    purchaser_limit?: number;
}

export interface PurchasableDto<T = any> extends PurchasableInterface {
    details?: T;
    purchaser_count?: number;
}

export type CreatePurchasableDto = PurchasableInterface;

export type UpdatePurchasableDto = PurchasableInterface;

export type PurchasablesResponseDto = PurchasableDto[];

export interface CreatePurchasablesResponseDto {
    purchasables: PurchasableInterface[];
    message: string;
}

export interface UpdatePurchasableResponseDto {
    purchasable: PurchasableInterface;
    message: string;
}
