export enum Size {
    XS = 'xs',
    S = 's',
    M = 'm',
    L = 'l',
    XL = 'xl',
    XXL = 'xxl'
}

export interface PurchaseInterface {
    quantity?: number;
    size?: Size;
    purchasable_id?: number;
    registration_id?: number;
}

export interface PurchaseRequestInterface {
    purchasable?: number;
    quantity?: number;
    size?: Size;
}

export interface PurchaseResponseInterface {
    purchase?: PurchaseInterface;
    message?: string;
}
