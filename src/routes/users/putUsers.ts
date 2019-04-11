import { Request, Response } from 'express';
import status from 'http-status-codes';
import jwt from 'jsonwebtoken';

import { User } from '@models/user.model';
import config from '@config/secrets';
import { EditUserResponseInterface } from '@app/interfaces/user.interface';
import { ErrorResponseInterface } from '@app/interfaces/shared.interface';
import { Scout } from '@models/scout.model';
import { ScoutResponseInterface } from '@interfaces/scout.interface';

export const updateProfile = async (req: Request, res: Response) => {
    try {
        const user: User = await User.findByPk(req.params.userId);

        if (!user) {
            throw new Error('Profile to update not found');
        }

        await user.update(req.body);

        user.set('password', null);

        const response: EditUserResponseInterface = {
            message: 'User profile updated',
            profile: user
        };

        if (req.body.password) {
            const token: string = jwt.sign(user.id, config.APP_SECRET);
            response.token = `JWT ${token}`;
        }

        return res.status(status.OK).json(response);
    } catch (err) {
        return res.status(status.BAD_REQUEST).json(<ErrorResponseInterface>{
            message: 'Error updating user',
            error: err
        });
    }
};

export const updateScout = async (req: Request, res: Response) => {
    try {
        const scout: Scout = await Scout.findByPk(req.params.scoutId);
        await scout.update(req.body);

        return res.status(status.OK).json(<ScoutResponseInterface>{
            message: 'Scout successfully updated',
            scout: scout
        });
    } catch (err) {
        return res.status(status.BAD_REQUEST).json(<ErrorResponseInterface>{
            message: 'Error updating scout',
            error: err
        });
    }
};

//   updateScout: function (req, res) {
//     var scoutUpdate = req.body;
//     var userId = req.params.userId;
//     var scoutId = req.params.scoutId;

//     return Models.User.findById(userId, {
//       include: [{
//         model: Models.Scout,
//         as: 'scouts'
//       }]
//     })
//       .then(function (user) {
//         if (!user) {
//           throw new Error('User not found');
//         }

//         return user.getScouts({
//           where: {
//             id: scoutId
//           }
//         });
//       })
//       .then(function (scouts) {
//         var scout = scouts[0];
//         return scout.update(scoutUpdate);
//       })
//       .then(function (scout) {
//         return res.status(status.OK).json({
//           message: 'Scout successfully updated',
//           scout: scout
//         });
//       })
//       .catch(function (err) {
//         res.status(status.BAD_REQUEST).json({
//           message: 'Error updating scout',
//           error: err
//         });
//       });
//   }
// };










