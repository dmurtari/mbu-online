import { Model, Table, Sequelize, Column, Unique, NotEmpty, DataType, BelongsToMany } from 'sequelize-typescript';
import { Offering } from '@models/offering';
import { Event } from '@models/event';

@Table({
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: [Sequelize.fn('lower', Sequelize.col('name')) as any]
      }
    ]
})
export class Badge extends Model<Badge> {
    @Column({
        allowNull: false,
    })
    @Unique
    @NotEmpty
    public name!: string;

    @Column({
        type: DataType.TEXT
    })
    public description: string;

    @Column
    public notes: string;

    @BelongsToMany(() => Event, () => Offering)
    public availabilitiy: Event[];
}
