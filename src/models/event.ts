import { Table, Model, Column, Validate, DataType, HasMany, BelongsToMany } from 'sequelize-typescript';

import { Purchasable } from '@models/purchasable';
import { Scout } from '@models/scout';
import { Registration } from '@models/registration';
import { Badge } from '@models/badge';
import { Offering } from '@models/offering';

export enum Semester {
    SPRING = 'Spring',
    FALL = 'Fall'
}

@Table({
    underscored: true
})
export class Event extends Model<Event> {
    @Column({
        allowNull: false
    })
    public year!: number;

    @Column({
        allowNull: false
    })
    @Validate({
        isIn: [['Spring', 'Fall']]
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

    @HasMany(() => Purchasable)
    public purchasables: Purchasable[];

    @BelongsToMany(() => Scout, () => Registration)
    public attendees: Scout[];

    @BelongsToMany(() => Badge, () => Offering)
    public offerings: Offering[];
}
