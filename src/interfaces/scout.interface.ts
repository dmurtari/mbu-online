export interface ScoutInterface {
    id?: number;
    firstname?: string;
    lastname?: string;
    birthday?: Date;
    troop?: number;
    notes?: string;
    emergency_name?: string;
    emergency_relation?: string;
    emergency_phone?: string;
    registrations?: any[];
}

export type ScoutRequestDto = ScoutInterface;

export interface ScoutResponseDto {
    message: string;
    scout: ScoutInterface;
}
