import { RegistrationAssignmentsDto } from '@interfaces/registration.interface';
import { OfferingDto } from '@interfaces/offering.interface';

export interface AssignmentInterface {
    periods?: number[];
    completions?: string[];
    offering_id?: number;
    registration_id?: number;
}

export interface CreateAssignmentRequestDto {
    periods?: number[];
    offering?: number;
    completions?: string[];
}

export interface CreateAssignmentResponseDto {
    message: string;
    registration: RegistrationAssignmentsDto;
}

export interface UpdateAssignmentResponseDto {
    message: string;
    assignment: AssignmentInterface;
}

export type ScoutAssignmentResponseDto = OfferingDto<AssignmentInterface>[];

