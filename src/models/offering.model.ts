import {
    Table,
    Model,
    PrimaryKey,
    Column,
    AutoIncrement,
    Min,
    Max,
    DataType,
    Default,
    ForeignKey,
    Validator,
    BeforeBulkCreate,
    BeforeValidate,
    BelongsTo,
    BelongsToMany
} from 'sequelize-typescript';
import { without } from 'lodash';

import { Event } from '@models/event.model';
import { Badge } from '@models/badge.model';
import { Registration } from '@models/registration.model';
import { Assignment } from '@models/assignment.model';
import { durationValidator } from '@models/validators'
import { OfferingInterface } from '@interfaces/offering.interface';

@Table({
    underscored: true,
    tableName: 'Offering'
})
export class Offering extends Model<Offering> implements OfferingInterface {
    @BeforeBulkCreate
    public static removeAllNullPeriods(offerings: Offering[]): void {
        offerings.forEach((offering: Offering) => {
          Offering.removeNullPeriods(offering);
        });
    }

    @BeforeValidate
    public static removeNullPeriods(offering: Offering): void {
        offering.periods = without(offering.periods, null);
    }

    @PrimaryKey
    @AutoIncrement
    @Column
    public id!: number;

    @Min(1)
    @Max(3)
    @Column({
        allowNull: false
    })
    public duration!: number;

    @Column({
        type: DataType.ARRAY(DataType.INTEGER),
        allowNull: false
    })
    public periods!: number[];

    @Default(0.0)
    @Column({
        allowNull: false,
        type: DataType.DECIMAL(5, 2)
    })
    public price!: number;

    @Default([])
    @Column({
        type: DataType.ARRAY(DataType.STRING),
        allowNull: false
    })
    public requirements!: string[];

    @ForeignKey(() => Event)
    @Column({
        unique: 'event_offering',
        allowNull: false
    })
    public event_id: number;

    @ForeignKey(() => Badge)
    @Column({
        unique: 'event_offering',
        allowNull: false
    })
    public badge_id: number;

    @Min(0)
    @Column({
        defaultValue: 20
    })
    public size_limit: number;

    @BelongsTo(() => Badge)
    public badge: Badge;

    @BelongsToMany(() => Registration, () => Assignment, 'registration_id', 'offering_id')
    public requesters: Registration[];

    @BelongsToMany(() => Registration, () => Assignment, 'registration_id', 'offering_id')
    public assignees: Registration[];

    @Validator
    public durationPeriodRelation(): void {
        if (!durationValidator(this.periods, this.duration)) {
          throw new Error('Duration validation failed');
        }
    }

    public async getClassSizes(): Promise<ClassSizeInformation> {
        const assignees: Registration[] = await this.$get('assignees') as Registration[];
        const assignments: Assignment[] = await Assignment.findAll({ where: { offering_id: this.id }});

        return assignments.reduce((result: ClassSizeInformation, assignment: Assignment) => {
            assignment.periods.forEach((period: number) => {
                (<any>result)[period] += 1;
            });
            return result;
        }, <ClassSizeInformation>{
            size_limit: this.size_limit,
            total: assignees.length,
            1: 0,
            2: 0,
            3: 0
        });
    }
}

export interface ClassSizeInformation {
    size_limit: number;
    total: number;
    1: number;
    2: number;
    3: number;
}
