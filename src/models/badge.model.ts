import { Model, Table, Sequelize, Column, Unique, NotEmpty, DataType, BelongsToMany } from 'sequelize-typescript';
import { Offering } from '@models/offering.model';
import { Event } from '@models/event.model';

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

    @BelongsToMany(() => Event, () => Offering)
    public availabilitiy: Event[];
}
