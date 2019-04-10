import { Request, Response } from 'express';
import { Op } from 'sequelize';
import jwt from 'jsonwebtoken';
import status from 'http-status-codes';

import config from '@config/secrets';
import { User } from '@models/user.model';
import { UserTokenResponseInterface } from '@interfaces/user.interface';
import { ErrorResponseInterface } from '@interfaces/shared.interface';

export const signup = async (req: Request, res: Response) => {
    if (!req.body.email || !req.body.password || !req.body.firstname || !req.body.lastname) {
        return res.status(status.BAD_REQUEST).json({
            message: 'Email, password, firstname, lastname required'
        });
    }

    const newUser: User = req.body;
    newUser.approved = false;

    try {
        const user: User = await User.create(newUser);
        await user.save();
        const token = jwt.sign(user.id, config.APP_SECRET);
        user.set('password', null);

        return res.status(status.CREATED).json(<UserTokenResponseInterface>{
            token: `JWT ${token}`,
            profile: user
        });
    } catch (err) {
        return res.status(status.BAD_REQUEST).json(<ErrorResponseInterface>{
            message: 'Failed to create user',
            error: err
        });
    }
};

export const authenticate = async (req: Request, res: Response) => {
    try {
        const user: User = await User.findOne({
            where: {
                email: {
                    [Op.iLike]: req.body.email
                }
            }
        });

        if (!user) {
            throw new Error('No matching email found');
        }

        if (await user.comparePassword(req.body.password)) {
            const token: string = jwt.sign(user.id, config.APP_SECRET);
            user.set('password', null);

            return res.status(status.OK).json(<UserTokenResponseInterface>{
                token: `JWT ${token}`,
                profile: user
            });
        } else {
            throw new Error('Password do no match');
        }
    } catch (err) {
        return res.status(status.UNAUTHORIZED).json(<ErrorResponseInterface>{
            message: 'User authentication failed',
            error: err
        });
    }
};

//   protected: function (req, res) {
//     res.status(status.OK).json({
//       message: 'Successfully authenticated',
//       profile: req.user
//     });
//   },
//   createScout: function (req, res) {
//     var userId = req.params.userId;
//     var scoutCreate = req.body;
//     var scout;

//     Model.Scout.create(scoutCreate)
//       .then(function (scoutFromDb) {
//         scout = scoutFromDb;
//         return Model.User.findById(userId, {
//           include: [{
//             model: Model.Scout,
//             as: 'scouts'
//           }]
//         });
//       })
//       .then(function (user) {
//         if (!user) {
//           throw new Error('User not found');
//         }

//         if (user.role !== 'coordinator') {
//           throw new Error('Can only add scouts to coordinators');
//         }
//         return user.addScouts(scout.id);
//       })
//       .then(function () {
//         return Model.Scout.findById(scout.id, {
//           include: [{
//             model: Model.Event,
//             as: 'registrations'
//           }]
//         });
//       })
//       .then(function (scout) {
//         return res.status(status.CREATED).json({
//           message: 'Scout successfully created',
//           scout: scout
//         });
//       })
//       .catch(function (err) {
//         return res.status(status.BAD_REQUEST).json({
//           message: 'Error creating scout',
//           error: err
//         });
//       });
//   }
// };
