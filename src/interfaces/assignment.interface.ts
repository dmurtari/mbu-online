export interface AssignmentInterface {
    periods?: number[];
    completions?: string[];
    offering_id?: number;
    registration_id?: number;
}

export interface AssignmentRequestInterface {
    periods?: number[];
    offering?: number;
    completions?: string[];
}

export interface AssignmentResponseInterface {
    message: string;
    assignment: AssignmentInterface;
}


