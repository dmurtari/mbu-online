import jwt from 'jsonwebtoken';
import status from 'http-status-codes';
import { Request, Response } from 'express';

import config from '@config/secrets';
import { User } from '@models/user.model';

export let signup = async (req: Request, res: Response) => {
    if (!req.body.email || !req.body.password || !req.body.firstname || !req.body.lastname) {
        return res.status(status.BAD_REQUEST).json({
            message: 'Email, password, firstname, lastname required'
        });
    }

    const newUser: User = req.body;
    newUser.approved = false;

    try {
        const user: User = await User.create(newUser)
        await user.save();
        const token = jwt.sign(user.id, config.APP_SECRET);

        return res.status(status.CREATED).json({
            token: 'JWT ' + token,
            profile: user
        });
    } catch (err) {
        return res.status(status.BAD_REQUEST).json({
            message: 'Failed to create user',
            error: err
        });
    }
}

// module.exports = {
//   signup: function (req, res) {
//     if (!req.body.email || !req.body.password ||
//       !req.body.firstname || !req.body.lastname) {
//       res.status(status.BAD_REQUEST).json({
//         message: 'Email, password, firstname, lastname required'
//       });
//     } else {
//       var newUser = req.body;
//       newUser.approved = false;
//       Model.User.create(newUser)
//         .then(function (user) {
//           return user.save(); // Trigger save hook
//         }).then(function (user) {
//           var token = jwt.sign(user.dataValues.id, config.APP_SECRET);
//           delete user.dataValues['password'];
//           return res.status(status.CREATED).json({
//             token: 'JWT ' + token,
//             profile: user
//           });
//         })
//         .catch(function (err) {
//           return res.status(status.BAD_REQUEST).json({
//             message: 'Failed to create user',
//             error: err
//           });
//         });
//     }
//   },
//   authenticate: function (req, res) {
//     var user;

//     Model.User.findOne({ where: { email: { $ilike: req.body.email } } })
//       .then(function (userFromDb) {
//         if (!userFromDb) {
//           throw new Error('No matching email found');
//         }
//         user = userFromDb;
//         return userFromDb.comparePassword(req.body.password);
//       })
//       .then(function (equal) {
//         if (!equal) {
//           throw new Error('Passwords do not match');
//         }

//         var token = jwt.sign(user.dataValues.id, config.APP_SECRET);
//         delete user.dataValues['password'];
//         return res.status(status.OK).json({
//           token: 'JWT ' + token,
//           profile: user.dataValues
//         });
//       })
//       .catch(function (err) {
//         return res.status(status.UNAUTHORIZED).json({
//           message: 'User authentication failed',
//           error: err
//         });
//       });
//   },
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
