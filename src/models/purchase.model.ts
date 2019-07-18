import { Table, Model, Column, Default, Min, ForeignKey, BeforeValidate } from 'sequelize-typescript';

import { Purchasable } from '@models/purchasable.model';
import { Registration } from '@models/registration.model';
import { Size, PurchaseInterface } from '@interfaces/purchase.interface';

@Table({
    underscored: true,
    tableName: 'Purchases'
})
export class Purchase extends Model<Purchase> implements PurchaseInterface {
    @BeforeValidate
    public static async ensurePurchaseLimit(purchase: Purchase): Promise<void> {
        try {
            const purchasable: Purchasable = await Purchasable.findByPk(purchase.purchasable_id);
            const currentPurchaserCount: number = await purchasable.getPurchaserCount();

            if (!purchasable.purchaser_limit) {
                return;
            }

            if (currentPurchaserCount + Number(purchase.quantity) > purchasable.purchaser_limit) {
                throw new Error(`Purchaser limit has been met`);
            }
        } catch {
            throw new Error(`Purchaser limit has been met`);
        }
    }

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
