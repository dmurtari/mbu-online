import { Model, Table, Column, Validator, ForeignKey, BelongsTo, BelongsToMany } from 'sequelize-typescript';
import moment from 'moment';

import { User } from './user';
import { Registration } from './registration';
import { Event } from './event';

@Table({
    underscored: true
})
export class Scout extends Model<Scout> {
    @Column({
        allowNull: false
    })
    public firstname!: string;

    @Column({
        allowNull: false
    })
    public lastname!: string;

    @Column({
        allowNull: false
    })
    public birthday!: Date;

    @Column({
        allowNull: false
    })
    public troop!: number;

    @Column
    public notes: string;

    @Column({
        allowNull: false
    })
    public emergency_name!: string;

    @Column({
        allowNull: false
    })
    public emergency_relation!: string;

    @Column({
        allowNull: false
    })
    public emergency_phone!: string;

    @ForeignKey(() => User)
    @Column
    public user_id: number;

    @BelongsTo(() => User)
    public user: User;

    @BelongsToMany(() => Event, () => Registration)
    public registrations: Event[];

    @Validator
    public birthdayInThePast(): void {
        if (this.birthday && !(this.birthday < new Date())) {
            throw new Error('Birthday must be in the past');
        }
    }

    public get fullName(): string {
        return `${this.firstname.trim()} ${this.lastname.trim()}`;
    }

    public get age(): number {
        return moment().diff(moment(this.birthday, 'years'));
    }
}
