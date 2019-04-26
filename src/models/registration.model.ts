import { Model, PrimaryKey, Column, AutoIncrement, ForeignKey, Table, BelongsToMany, BelongsTo } from 'sequelize-typescript';

import { Event } from '@models/event.model';
import { Scout } from '@models/scout.model';
import { Offering } from '@models/offering.model';
import { Preference } from '@models/preference.model';
import { Assignment } from '@models/assignment.model';
import { Purchasable } from '@models/purchasable.model';
import { Purchase } from '@models/purchase.model';

@Table({
    underscored: true,
    tableName: 'Registration'
})
export class Registration extends Model<Registration> {
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
        return 0;
    }

    public async actualCost(): Promise<number> {
        return 0;
    }
}


//   Registration.prototype.projectedCost = function () {
//     var totalCost = 0;
//     var registration = this;

//     return registration.getPurchases()
//       .then(function (purchases) {
//         totalCost = _.reduce(purchases, function (sum, purchase) {
//           return sum + (Number(purchase.price) * Number(purchase.Purchase.quantity));
//         }, totalCost);

//         return registration.getPreferences();
//       })
//       .then(function (preferences) {
//         totalCost = _.reduce(preferences, function (sum, preference) {
//           return sum + Number(preference.price);
//         }, totalCost);

//         return sequelize.models.Event.findById(registration.event_id);
//       })
//       .then(function (event) {
//         totalCost += Number(event.price);
//         return totalCost;
//       });
//   }

//   Registration.prototype.actualCost = function () {
//     var totalCost = 0;
//     var registration = this;

//     return registration.getPurchases()
//       .then(function (purchases) {
//         totalCost = _.reduce(purchases, function (sum, purchase) {
//           return sum + (Number(purchase.price) * Number(purchase.Purchase.quantity));
//         }, totalCost);

//         return registration.getAssignments();
//       })
//       .then(function (assignments) {
//         totalCost = _.reduce(assignments, function (sum, assignment) {
//           return sum + Number(assignment.price);
//         }, totalCost);

//         return sequelize.models.Event.findById(registration.event_id);
//       })
//       .then(function (event) {
//         totalCost += Number(event.price);
//         return totalCost;
//       });
//   }
