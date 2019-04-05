import { Model, PrimaryKey, Column, AutoIncrement, ForeignKey, Table, BelongsToMany, BelongsTo } from 'sequelize-typescript';

import { Event } from '@models/event';
import { Scout } from '@models/scout';
import { Offering } from '@models/offering';
import { Preference } from '@models/preference';
import { Assignment } from '@models/assignment';
import { Purchasable } from '@models/purchasable';
import { Purchase } from '@models/purchase';

var _ = require('lodash');

@Table({
    underscored: true
})
export class Registration extends Model<Registration> {
    @PrimaryKey
    @Column
    @AutoIncrement
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

    @BelongsToMany(() => Offering, () => Preference)
    public preferences: Offering[];

    @BelongsToMany(() => Offering, () => Assignment)
    public assignments: Offering[];

    @BelongsToMany(() => Purchasable, () => Purchase)
    public purchases: Purchasable[];
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
