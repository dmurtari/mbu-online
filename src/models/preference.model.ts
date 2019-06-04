import { Table, Model, Column, Min, Max, ForeignKey } from 'sequelize-typescript';

import { Offering } from '@models/offering.model';
import { Registration } from '@models/registration.model';
import { PreferenceInterface } from '@interfaces/preference.interface';

@Table({
    underscored: true,
    tableName: 'Preferences'
})
export class Preference extends Model<Preference> implements PreferenceInterface {
    @Min(1)
    @Max(6)
    @Column({
      allowNull: false
    })
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
