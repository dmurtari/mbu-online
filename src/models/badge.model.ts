import { Model, Table, Sequelize, Column, Unique, NotEmpty, DataType, BelongsToMany } from 'sequelize-typescript';

import { Offering } from '@models/offering.model';
import { Event } from '@models/event.model';
import { BadgeInterface } from '@interfaces/badge.interface';

@Table({
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: [Sequelize.fn('lower', Sequelize.col('name')) as any]
      }
    ],
    tableName: 'Badge'
})
export class Badge extends Model<Badge> implements BadgeInterface {

    @NotEmpty
    @Unique
    @Column({
        allowNull: false,
    })
    public name!: string;

    @Column({
        type: DataType.TEXT
    })
    public description: string;

    @Column
    public notes: string;

    @BelongsToMany(() => Event, () => Offering, 'badge_id', 'event_id')
    public availability: Event[];
}
