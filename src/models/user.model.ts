import { Sequelize } from 'sequelize';
import bcrypt from 'bcrypt';
import { isEmpty, omit } from 'lodash';
import {
    Model,
    Table,
    Column,
    Default,
    DataType,
    Validator,
    BeforeCreate,
    BeforeUpdate,
    HasMany
} from 'sequelize-typescript';

import { Scout } from '@models/scout.model';

export enum UserRole {
    ADMIN = 'admin',
    COORDINATOR = 'coordinator',
    TEACHER = 'teacher',
    ANONYMOUS = 'anonymous'
}

@Table({
    underscored: true,
    indexes: [
        {
            unique: true,
            fields: [Sequelize.fn('lower', Sequelize.col('email')) as any]
        }
    ]
})
export class User extends Model<User> {
    static readonly SALT_FACTOR = process.env.NODE_ENV === 'test' ? 1 : 12;

    @Column({
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true,
            notEmpty: true
        }
    })
    public email!: string;

    @Column({
        allowNull: false
    })
    public password!: string;

    @Column
    public reset_password_token: string;

    @Column
    public reset_token_expires: Date;

    @Column({
        allowNull: false,
        validate: {
            notEmpty: true
        }
    })
    public firstname!: string;

    @Column({
        allowNull: false,
        validate: {
            notEmpty: true
        }
    })
    public lastname!: string;

    @Default(UserRole.ANONYMOUS)
    @Column({
        allowNull: false,
        defaultValue: UserRole.ANONYMOUS,
        validate: {
            isIn: [
                ['admin', 'coordinator', 'teacher', 'anonymous']
            ]
        }
    })
    public role!: string;

    @Default(false)
    @Column
    public approved!: boolean;

    @Default({})
    @Column(DataType.JSON)
    public details: Object;

    @HasMany(() => Scout)
    public scouts: Scout[]

    public get fullname(): string {
        return `${this.firstname.trim()} ${this.lastname.trim()}`;
    }

    @Validator
    public detailsValidator() {
        let allowedFields;

        if (this.role === UserRole.COORDINATOR) {
            allowedFields = ['troop', 'district', 'council'];
            if (!isEmpty(omit(this.details, allowedFields))) {
                throw new Error('Invalid details for coordinator');
            }
        }

        if (this.role === UserRole.TEACHER) {
            allowedFields = ['chapter'];
            if (!isEmpty(omit(this.details, allowedFields))) {
                throw new Error('Invalid details for teacher');
            }
        }
    }

    @BeforeCreate
    public static async hashPassword(user: User) {
        const salt = await bcrypt.genSalt(User.SALT_FACTOR);
        const hashedPassword = await bcrypt.hash(user.password, salt);
        user.password = hashedPassword;
    }

    @BeforeUpdate
    public static async updateHashedPassword(user: User) {
        if (user.changed('password')) {
            const salt = await bcrypt.genSalt(User.SALT_FACTOR);
            const hashedPassword = await bcrypt.hash(user.password, salt);
            user.password = hashedPassword;
        }
    }

    public comparePassword(candidatePassword: string): Promise<boolean> {
        return bcrypt.compare(candidatePassword, this.password);
    }
}
