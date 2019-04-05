import { Table, Model, Column, Min, Max, ForeignKey } from 'sequelize-typescript';

import { Offering } from '@models/offering';
import { Registration } from '@models/registration';

@Table({
    underscored: true
})
export class Preference extends Model<Preference> {
    @Column({
      allowNull: false
    })
    @Min(1)
    @Max(6)
    public rank!: number;

    @ForeignKey(() => Offering)
    @Column({
      allowNull: false
    })
    public offering_id!: number;

    @ForeignKey(() => Registration)
    @Column({
      allowNull: false
    })
    public registration_id!: number;
}
