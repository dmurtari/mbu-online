import { Table, Model, ForeignKey, BelongsTo } from 'sequelize-typescript';

import { Event } from './event';

@Table({
    underscored: true,
    freezeTableName: true,
    tableName: 'CurrentEvent'
})
export class CurrentEvent extends Model<CurrentEvent> {
    @ForeignKey(() => Event)
    public event_id: string;

    @BelongsTo(() => Event)
    public event: Event;
}