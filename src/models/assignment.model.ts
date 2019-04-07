import { Table, Model, Column, DataType, Default, ForeignKey, BeforeValidate } from 'sequelize-typescript';

import { Offering, ClassSizeInformation } from '@models/offering.model';
import { Registration } from '@models/registration.model';

@Table({
    underscored: true,
    tableName: 'Assignment'
})
export class Assignment extends Model<Assignment> {
    @Column({
        allowNull: false,
        type: DataType.ARRAY(DataType.INTEGER)
    })
    public periods!: number[];

    @Default([])
    @Column({
        allowNull: false,
        type: DataType.ARRAY(DataType.STRING)
    })
    public completions: string[];

    @ForeignKey(() => Offering)
    @Column({
        allowNull: false
    })
    public offering_id!: number;

    @ForeignKey(() => Registration)
    @Column({
        allowNull: false
    })
    public registration_id!: number;

    @BeforeValidate
    public static async ensureSizeLimit(assignment: Assignment): Promise<void> {
        if (!assignment.changed('periods')) {
            return;
        }

        try {
            const offering: Offering = await Offering.findByPk(assignment.offering_id);
            const sizes: ClassSizeInformation = await offering.getClassSizes();

            assignment.periods.forEach((period: number) => {
                if ((<any>sizes)[period] >= sizes.size_limit) {
                    throw new Error(`Offering is at the size limit for period ${period}`);
                }
            });
        } catch {
            throw new Error('Offering is at the class limit for the given periods');
        }
    }
}
