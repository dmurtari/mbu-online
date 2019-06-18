import { Model, Column, Default, DataType, Table, Validator, ForeignKey, HasMany, BelongsToMany, Min } from 'sequelize-typescript';

import { Purchase } from '@models/purchase.model';
import { Registration } from '@models/registration.model';
import { Event } from '@models/event.model';
import { PurchasableInterface } from '@interfaces/purchasable.interface';

@Table({
    underscored: true,
    tableName: 'Purchasables'
})
export class Purchasable extends Model<Purchasable> implements PurchasableInterface {
    @Column({
        allowNull: false
    })
    public item!: string;

    @Column
    public description: string;

    @Default(false)
    @Column
    public has_size!: boolean;

    @Column({
        type: DataType.DECIMAL(5, 2),
        allowNull: false
    })
    public price!: number;

    @Column
    public maximum_age: number;

    @Column
    public minimum_age: number;

    @Min(0)
    @Column
    public purchaser_limit: number;

    @HasMany(() => Purchase, 'purchasable_id')
    public sold: Purchase[];

    @BelongsToMany(() => Registration, () => Purchase, 'purchasable_id', 'registration_id')
    public buyers: Registration[];

    @ForeignKey(() => Event)
    public event_id: number;

    public Purchase: Purchase;

    @Validator
    public maxGreaterThanMin(): void {
        if (this.maximum_age && this.minimum_age && (this.maximum_age < this.minimum_age)) {
            throw new Error('Max age must be greater than min');
        }
    }

    public async getPurchaserCount(): Promise<number> {
        const purchases: Purchase[] = await Purchase.findAll({
            where: {
                purchasable_id: this.id
            }
        });

        return purchases.reduce((acc, cur) => acc += cur.quantity, 0);
    }
}
