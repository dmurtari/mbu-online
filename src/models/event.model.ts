import { Table, Model, Column, Validate, DataType, HasMany, BelongsToMany } from 'sequelize-typescript';

import { Purchasable } from '@models/purchasable.model';
import { Scout } from '@models/scout.model';
import { Registration } from '@models/registration.model';
import { Badge } from '@models/badge.model';
import { Offering } from '@models/offering.model';
import { Semester, EventInterface } from '@interfaces/event.interface';

@Table({
    underscored: true,
    tableName: 'Event'
})
export class Event extends Model<Event> implements EventInterface {
    @Column({
        allowNull: false
    })
    public year!: number;

    @Validate({
        isIn: [['Spring', 'Fall']]
    })
    @Column({
        allowNull: false,
        type: DataType.STRING
    })
    public semester!: Semester;

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

    @BelongsToMany(() => Scout, () => Registration, 'event_id', 'scout_id')
    public attendees: Scout[];

    @BelongsToMany(() => Badge, () => Offering, 'event_id', 'badge_id')
    public offerings: Badge[];
}
