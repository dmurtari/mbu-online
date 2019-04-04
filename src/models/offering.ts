import { Table, Model, PrimaryKey, Column, AutoIncrement, Validate, Min, Max, DataType, Default, ForeignKey, Unique, Validator, BeforeBulkCreate, BeforeValidate } from 'sequelize-typescript';
import { Event } from './event';
import { Badge } from './badge';
import { Scout } from './scout';
import { Registration } from './registration';

var validators = require('./validators');
var _ = require('lodash');

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

    @Validator
    public durationPeriodRelation(): void {
        if (!validators.durationValidator(this.periods, this.duration)) {
          throw new Error('Duration validation failed');
        }
    }

    @BeforeBulkCreate
    public removeAllNullPeriods(offerings: Offering[]) {
        _.forEach(offerings, (offering: Offering) => {
          this.removeNullPeriods(offering);
        });
    }

    @BeforeValidate
    public removeNullPeriods(offering: Offering) {
        offering.periods = _.without(offering.periods, null);
    }

    public getClassSizes(): Promise<ClassSizeInformation> {
        const assignees: Registration[] = await this.$get('assignees') as Registration[];

        // assignees.reduce((result: ClassSizeInterface, assignee: Registration) => {
        //     assignee
        // }, <ClassSizeInterface>{
        //     size_limit: this.size_limit,
        //     total: assignees.length,
        //     1: 0,
        //     2: 0,
        //     3: 0
        // });
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
