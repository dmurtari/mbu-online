export interface PreferenceInterface {
    rank?: number;
    offering_id?: number;
    registration_id?: number;
}

export interface PreferenceRequestInterface {
    rank: number;
    offering: number;
}

export interface PreferenceResponseInterface {
    preference: PreferenceInterface;
    message: string;
}
