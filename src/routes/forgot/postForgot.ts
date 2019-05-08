import { Request, Response, NextFunction } from 'express';
import status from 'http-status-codes';
import { randomBytes } from 'crypto';
import { Op } from 'sequelize';
import mailer from '@sendgrid/mail';
import { MailData } from '@sendgrid/helpers/classes/mail';

import { User } from '@models/user.model';
import secrets from '@config/secrets';
import { MessageResponseInterface, ErrorResponseInterface } from '@interfaces/shared.interface';

export const forgot = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const token: string = (await randomBytes(20)).toString('hex');
        const user: User = await User.findOne({
            where: {
                email: {
                    [Op.iLike]: req.body.email
                }
            }
        });

        if (!user) {
            throw new Error('User to reset not found');
        }

        user.reset_password_token = token;
        user.reset_token_expires = new Date(Date.now() + 3600000);

        await user.save();

        mailer.setApiKey(secrets.SENDGRID_API_KEY);
        mailer.setSubstitutionWrappers('{{', '}}');

        const url: string = req.body.url || `http://${req.headers.host}/api/reset/`;
        const message: MailData = {
            to: user.email,
            from: 'no-reply@mbu.online',
            subject: 'MBU Online Password Reset',
            templateId: 'b6cd8257-e07c-4390-9c58-cf2267e36e20',
            substitutions: {
                url: url,
                token: token
            },
            content: [
                {
                    type: 'text/plain',
                    value: 'Textual content'
                }
            ]
        };

        await mailer.send(message)
            .then(() => res.status(status.OK).json(<MessageResponseInterface>{
                message: `An e-email has been sent to ${user.email} with further instructions`
            }))
            .catch((err) => res.status(status.INTERNAL_SERVER_ERROR).json(<ErrorResponseInterface>{
                error: err,
                message: 'Failed to send email'
            }));
    } catch (err) {
        return next(err);
    }
};

export const reset = async (req: Request, res: Response) => {
    try {
        const user: User = await User.findOne({
            where: {
                reset_password_token: req.body.token,
                reset_token_expires: {
                    [Op.gt]: Date.now()
                }
            }
        });

        if (!user) {
            throw new Error('User now found');
        }

        user.password = req.body.password;
        user.reset_password_token = null;
        user.reset_token_expires = null;

        await user.save();

        mailer.setApiKey(secrets.SENDGRID_API_KEY);
        mailer.setSubstitutionWrappers('{{', '}}');

        const url: string = req.body.url || `http://${req.headers.host}/api/reset/`;
        const message: MailData = {
            to: user.email,
            from: 'no-reply@mbu.online',
            subject: 'MBU Online Password Changed',
            templateId: '6822bdf9-bdb2-4359-ab1a-6f5dc9ca2d2c',
            substitutions: {
                email: user.email
            },
            content: [
                {
                    type: 'text/plain',
                    value: 'Textual content'
                }
            ]
        };

        await mailer.send(message)
            .then(() => res.status(status.OK).json(<MessageResponseInterface>{
                message: `Password change confirmation sent to ${user.email}`
            }))
            .catch((err) => res.status(status.INTERNAL_SERVER_ERROR).json(<ErrorResponseInterface>{
                error: err,
                message: 'Failed to send confirmation email'
            }));
    } catch (err) {
        return res.status(status.INTERNAL_SERVER_ERROR).json(<ErrorResponseInterface>{
            error: err,
            message: 'Reset password failed'
        });
    }
};
