import { Request, Response } from 'express';
import status from 'http-status-codes';

import { User } from '@models/user.model';
import { ErrorResponseDto } from '@app/interfaces/shared.interface';
import { Scout } from '@models/scout.model';

export const deleteUser = async (req: Request, res: Response) => {
    try {
        const user: User = await User.findByPk(req.params.userId);
        await user.destroy();
        return res.status(status.OK).end();
    } catch (err) {
        return res.status(status.BAD_REQUEST).json(<ErrorResponseDto> {
            message: 'Failed to delete user',
            error: err
        });
    }
};

export const deleteScout = async (req: Request, res: Response) => {
    try {
        const user: User = await User.findByPk(req.params.userId);
        const deleted: Scout = await user.$remove('scouts', req.params.scoutId);

        await Scout.findByPk(req.params.scoutId).then((scout) => scout.destroy());

        if (!deleted) {
            throw new Error('No scout to delete');
        }

        return res.status(status.OK).end();
    } catch (err) {
        return res.status(status.BAD_REQUEST).json(<ErrorResponseDto> {
            message: 'Failed to delete scout' ,
            error: err
        });
    }
};
