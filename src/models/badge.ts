import { Model, Table, Sequelize, Column, Unique, NotEmpty, DataType } from 'sequelize-typescript';

@Table({
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: [Sequelize.fn('lower', Sequelize.col('name')) as any]
      }
    ]
})
export class Badge extends Model<Badge> {
    @Column({
        allowNull: false,
    })
    @Unique
    @NotEmpty
    public name!: string;

    @Column({
        type: DataType.TEXT
    })
    public description: string;

    @Column
    public notes: string;    
}