import { Model, PrimaryKey, Column, AutoIncrement, ForeignKey, Table, BelongsToMany, BelongsTo } from 'sequelize-typescript';

import { Event } from '@models/event.model';
import { Scout } from '@models/scout.model';
import { Offering } from '@models/offering.model';
import { Preference } from '@models/preference.model';
import { Assignment } from '@models/assignment.model';
import { Purchasable } from '@models/purchasable.model';
import { Purchase } from '@models/purchase.model';
import { RegistrationInterface } from '@interfaces/registration.interface';

@Table({
    underscored: true,
    tableName: 'Registration'
})
export class Registration extends Model<Registration> implements RegistrationInterface {
    @PrimaryKey
    @AutoIncrement
    @Column
    public id: number;

    @ForeignKey(() => Event)
    @Column({
        allowNull: false,
        unique: 'event_registration'
    })
    public event_id!: number;

    @ForeignKey(() => Scout)
    @Column({
        allowNull: false,
        unique: 'event_registration'
    })
    public scout_id!: number;

    @Column
    public notes: string;

    @BelongsTo(() => Scout)
    public scout: Scout;

    @BelongsToMany(() => Offering, () => Preference, 'registration_id', 'offering_id')
    public preferences: Offering[];

    @BelongsToMany(() => Offering, () => Assignment, 'registration_id', 'offering_id')
    public assignments: Offering[];

    @BelongsToMany(() => Purchasable, () => Purchase, 'registration_id', 'purchasable_id')
    public purchases: Purchasable[];

    public async projectedCost(): Promise<number> {
        let totalCost: number = 0;

        const [purchases, preferences, event]: [Purchasable[], Offering[], Event] = await Promise.all([
            this.$get('purchases'),
            this.$get('preferences'),
            Event.findByPk(this.event_id)
        ]) as [Purchasable[], Offering[], Event];

        totalCost = purchases.reduce((sum, purchase) => {
            return sum + (Number(purchase.price) * Number(purchase.Purchase.quantity));
        }, totalCost);

        totalCost = preferences.reduce((sum, preference) => {
            return sum + Number(preference.price);
        }, totalCost);

        totalCost += Number(event.price);

        return totalCost;
    }

    public async actualCost(): Promise<number> {
        let totalCost: number = 0;

        const [purchases, assignments, event]: [Purchasable[], Offering[], Event] = await Promise.all([
            this.$get('purchases'),
            this.$get('assignments'),
            Event.findByPk(this.event_id)
        ]) as [Purchasable[], Offering[], Event];

        totalCost = purchases.reduce((sum, purchase) => {
            return sum + (Number(purchase.price) * Number(purchase.Purchase.quantity));
        }, totalCost);

        totalCost = assignments.reduce((sum, assignment) => {
            return sum + Number(assignment.price);
        }, totalCost);

        totalCost += Number(event.price);

        return totalCost;
    }
}
