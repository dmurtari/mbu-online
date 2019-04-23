export interface PurchasableInterface {
    item?: string;
    description?: string;
    has_size?: boolean;
    price?: number|string;
    maximum_age?: number;
    minimum_age?: number;
}

export interface PurchasablesResponseInterface {
    purchasables: PurchasableInterface[];
    message: string;
}

export interface PurchasableResponseInterface {
    purchasable: PurchasableInterface;
    message: string;
}
