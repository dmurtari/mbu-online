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

import { Event } from '@models/event';
import { Badge } from '@models/badge';
import { Registration } from '@models/registration';
import { Assignment } from '@models/assignment';
import { durationValidator } from '@models/validators';

@Table({
    underscored: true
})
export class Offering extends Model<Offering> {
    @PrimaryKey
    @Column
    @AutoIncrement
    public id!: number;

    @Column({
        allowNull: false
    })
    @Min(1)
    @Max(3)
    public duration!: number;

    @Column({
        type: DataType.ARRAY(DataType.INTEGER),
        allowNull: false
    })
    public periods!: number[];

    @Column({
        allowNull: false,
        type: DataType.DECIMAL(5, 2)
    })
    @Default(0.0)
    public price!: number;

    @Column({
        type: DataType.ARRAY(DataType.STRING),
        allowNull: false
    })
    @Default([])
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

    @Column({
        defaultValue: 20
    })
    @Min(0)
    public size_limit: number;

    @BelongsTo(() => Badge)
    public badge: Badge;

    @BelongsToMany(() => Registration, () => Assignment)
    public requesters: Registration[];

    @BelongsToMany(() => Registration, () => Assignment)
    public assignees: Registration[];

    @Validator
    public durationPeriodRelation(): void {
        if (!durationValidator(this.periods, this.duration)) {
          throw new Error('Duration validation failed');
        }
    }

    @BeforeBulkCreate
    public removeAllNullPeriods(offerings: Offering[]): void {
        offerings.forEach((offering: Offering) => {
          this.removeNullPeriods(offering);
        });
    }

    @BeforeValidate
    public removeNullPeriods(offering: Offering): void {
        offering.periods = without(offering.periods, null);
    }

    public getClassSizes(): Promise<ClassSizeInformation> {
        const assignees: Registration[] = await this.$get('assignees') as Registration[];

        assignees.reduce((result: ClassSizeInformation, assignee: Registration) => {
            // const assignment = await Assignment.findByPk(assignee)
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


  Offering.prototype.getClassSizes = function () {
    var offering = this;

    return this.getAssignees()
      .then(function (assignees) {
        return _.reduce(assignees, function (result, assignee) {
          _.forEach(assignee.Assignment.periods, function (period) {
            result[period] += 1
          });

          return result;
        }, {
          size_limit: offering.size_limit,
          total: assignees.length,
          1: 0,
          2: 0,
          3: 0
        });
      });
  };

  return Offering;
};
