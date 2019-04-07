import { Table, Model, Column, Default, Min, Max, ForeignKey } from 'sequelize-typescript';

import { Purchasable } from '@models/purchasable.model';
import { Registration } from '@models/registration.model';

export enum ShirtSize {
    XS = 'xs',
    S = 's',
    M = 'm',
    L = 'l',
    XL = 'xl',
    XXL = 'xxl'
}

@Table({
    underscored: true,
    tableName: 'Purchase'
})
export class Purchase extends Model<Purchase> {
    @Default(0)
    @Min(0)
    @Max(0)
    @Column({
        allowNull: false
    })
    public quantity!: number;

    @Column({
        validate: { isIn: [['xs', 's', 'm', 'l', 'xl', 'xxl']] }
    })
    public size: ShirtSize;

    @ForeignKey(() => Purchasable)
    @Column({
        allowNull: false
    })
    public purchasable_id!: number;

    @ForeignKey(() => Registration)
    @Column({
        allowNull: false
    })
    public registration_id!: number;
}
