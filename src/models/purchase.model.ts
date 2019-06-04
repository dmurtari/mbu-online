import { Table, Model, Column, Default, Min, Max, ForeignKey } from 'sequelize-typescript';

import { Purchasable } from '@models/purchasable.model';
import { Registration } from '@models/registration.model';
import { Size, PurchaseInterface } from '@interfaces/purchase.interface';

@Table({
    underscored: true,
    tableName: 'Purchases'
})
export class Purchase extends Model<Purchase> implements PurchaseInterface {
    @Default(0)
    @Min(0)
    @Column({
        allowNull: false
    })
    public quantity!: number;

    @Column({
        validate: { isIn: [['xs', 's', 'm', 'l', 'xl', 'xxl']] }
    })
    public size: Size;

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
