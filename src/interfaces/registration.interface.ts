export interface RegistrationInterface {
    id?: number;
    event_id?: number;
    scout_id?: number;
    notes?: string;
}

export interface RegistrationResponseInterface {
    message: string;
    registration: RegistrationInterface;
}

export interface RegistrationRequestInterface {
    event_id?: string;
    notes?: string;
}
