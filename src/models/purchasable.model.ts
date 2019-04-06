import { Model, Column, Default, DataType, Table, Validator, ForeignKey, HasMany, BelongsToMany } from 'sequelize-typescript';

import { Purchase } from '@models/purchase.model';
import { Registration } from '@models/registration.model';
import { Event } from './event.model';

@Table({
    underscored: true
})
export class Purchasable extends Model<Purchasable> {
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

    @HasMany(() => Purchase)
    public sold: Purchase[];

    @BelongsToMany(() => Registration, () => Purchase)
    public buyers: Registration[];

    @ForeignKey(() => Event)
    public event_id: number;

    @Validator
    public maxGreaterThanMin(): void {
        if (this.maximum_age && this.minimum_age && (this.maximum_age < this.minimum_age)) {
            throw new Error('Max age must be greater than min');
        }
    }
}
