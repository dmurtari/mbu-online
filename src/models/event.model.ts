import { Table, Model, Column, Validate, DataType, HasMany, BelongsToMany } from 'sequelize-typescript';

import { Purchasable } from '@models/purchasable.model';
import { Scout } from '@models/scout.model';
import { Registration } from '@models/registration.model';
import { Badge } from '@models/badge.model';
import { Offering } from '@models/offering.model';

export enum Semester {
    SPRING = 'Spring',
    FALL = 'Fall'
}

@Table({
    underscored: true,
    tableName: 'Event'
})
export class Event extends Model<Event> {
    @Column({
        allowNull: false
    })
    public year!: number;

    @Validate({
        isIn: [['Spring', 'Fall']]
    })
    @Column({
        allowNull: false
    })
    public semester!: string;

    @Column({
        allowNull: false,
        unique: true
    })
    public date!: Date;

    @Column({
        allowNull: false
    })
    public registration_open!: Date;

    @Column({
        allowNull: false
    })
    public registration_close!: Date;

    @Column({
        allowNull: false,
        type: DataType.DECIMAL(5, 2)
    })
    public price!: number;

    @HasMany(() => Purchasable, 'event_id')
    public purchasables: Purchasable[];

    @BelongsToMany(() => Scout, () => Registration, 'scout_id', 'event_id')
    public attendees: Scout[];

    @BelongsToMany(() => Badge, () => Offering, 'badge_id', 'event_id')
    public offerings: Offering[];
}
