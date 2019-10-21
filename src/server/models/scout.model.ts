import { Model, Table, Column, Validator, ForeignKey, BelongsTo, BelongsToMany, DataType } from 'sequelize-typescript';
import moment from 'moment';

import { User } from '@models/user.model';
import { Registration } from '@models/registration.model';
import { Event } from '@models/event.model';
import { ScoutInterface } from '@interfaces/scout.interface';

@Table({
    underscored: true,
    tableName: 'Scouts'
})
export class Scout extends Model<Scout> implements ScoutInterface {
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

    @Column(DataType.VIRTUAL)
    public get fullname(): string {
        return `${(this.firstname || '').trim()} ${(this.lastname || '').trim()}`;
    }

    @Column(DataType.VIRTUAL)
    public get age(): number {
        return moment().diff(moment(this.birthday), 'years');
    }

    @ForeignKey(() => User)
    @Column
    public user_id: number;

    @BelongsTo(() => User)
    public user: User;

    @BelongsToMany(() => Event, () => Registration, 'scout_id', 'event_id')
    public registrations: Event[];

    @Validator
    public birthdayInThePast(): void {
        if (this.birthday && !(this.birthday < new Date())) {
            throw new Error('Birthday must be in the past');
        }
    }
}
