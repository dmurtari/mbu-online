
import { Request, Response } from 'express';
import status from 'http-status-codes';

import { User } from '@models/user.model';
import { Op, WhereOptions, Includeable } from 'sequelize';
import { ErrorResponseInterface } from '@interfaces/shared.interface';
import { UserExistsResponseInterface, TokenAuthResponseInterface } from '@interfaces/user.interface';
import { Scout } from '@models/scout.model';

export const byEmail = async (req: Request, res: Response) => {
    try {
        const users: User[] = await User.findAll({
            where: {
                email: {
                    [ Op.iLike ]: req.params.email
                }
            }
        });

        res.status(status.OK).json(<UserExistsResponseInterface>{ exists: users.length > 0 });
    } catch (err) {
        res.status(status.BAD_REQUEST).json(<ErrorResponseInterface>{
            message: 'Failed to find users',
            error: err
        });
    }
};

export const fromToken = async (req: Request, res: Response) => {
    return res.status(status.OK).json(<TokenAuthResponseInterface>{
        message: 'Successfully authenticated',
        profile: req.user
    });
};

export const byId = (includeScouts: boolean = false) => async (req: Request, res: Response) => {
    let query: WhereOptions;
    const include: Includeable[] = [];

    if (req.params.userId) {
        query = { id: req.params.userId };
    } else if (req.params.id) {
        query = { id: req.params.id };
    } else if (!req.query) {
        query = {};
    } else {
        return res.status(status.BAD_REQUEST).json(<ErrorResponseInterface>{
            message: 'Invalid query'
        });
    }

    if (includeScouts) {
        include.push({
            model: Scout,
            as: 'scouts'
        });
    }

    try {
        const users: User[] = await User.findAll({
            where: query,
            attributes: {
                exclude: [ 'password' ]
            },
            include: include
        });

        if (users.length < 1)  {
            throw new Error('User not found');
        }

        return res.status(status.OK).json(users);
    } catch (err) {
        return res.status(status.BAD_REQUEST).json(<ErrorResponseInterface>{
            error: err,
            message: 'Error getting user'
        });
    }
};

// module.exports = {
//   get: function (shouldIncludeScouts) {
//     return function (req, res) {
//       var query = {};

//       if (req.params.userId) {
//         query.id = req.params.userId;
//       } else if (req.query.id) {
//         query.id = req.query.id;
//       } else if (_.isEmpty(req.query)) {
//         query = {};
//       } else {
//         return res.status(status.BAD_REQUEST).json({
//           message: 'Invalid query'
//         });
//       }

//       var modelsToInclude = [];

//       if (shouldIncludeScouts) {
//         modelsToInclude = [{
//           model: Models.Scout,
//           as: 'scouts'
//         }];
//       }

//       return Models.User.findAll({
//         where: query,
//         attributes: {
//           exclude: ['password'],
//         },
//         include: modelsToInclude
//       })
//         .then(function (users) {
//           if (users.length < 1) {
//             throw new Error('User not found');
//           }

//           return res.status(status.OK).json(users);
//         })
//         .catch(function (err) {
//           return res.status(status.BAD_REQUEST).json({
//             error: err,
//             message: 'Error getting user'
//           });
//         });
//     };
//   },
//   getEventRegistrations: function (req, res) {
//     var query = _.cloneDeep(registrationInformation);

//     query.where = {
//       event_id: req.params.eventId
//     };

//     query.include[0].where = {
//       user_id: req.params.userId
//     }

//     Models.Registration.findAll(query)
//       .then(function (registrations) {
//         res.status(status.OK).json(registrations);
//       })
//       .catch(function (err) {
//         res.status(status.BAD_REQUEST).json({
//           message: 'Could not get registration for scout ' + scoutId,
//           error: err
//         });
//       });
//   },
//   getScoutRegistrations: function (req, res) {
//     return Models.Scout.findAll({
//       where: {
//         user_id: req.params.userId,
//       },
//       include: [{
//         model: Models.Event,
//         as: 'registrations',
//         through: {
//           as: 'details'
//         },
//         attributes: [['id', 'event_id']]
//       }]
//     })
//       .then(function (scouts) {
//         return res.status(status.OK).json(scouts);
//       })
//       .catch(function (err) {
//         return res.status(status.BAD_REQUEST).json({
//           error: err,
//           message: 'Error getting registrations'
//         });
//       });
//   },
//   getProjectedCost: function (req, res) {
//     getCost(req, res, 'projectedCost');
//   },
//   getActualCost: function (req, res) {
//     getCost(req, res, 'actualCost');
//   }
// };

// function getCost(req, res, type) {
//   var eventId = req.params.eventId;

//   return Models.Scout.findAll({
//     where: {
//       user_id: req.params.userId
//     },
//     include: [{
//       model: Models.Event,
//       as: 'registrations',
//       where: {
//         id: eventId
//       },
//       through: {
//         as: 'details'
//       }
//     }]
//   })
//     .then(function (scouts) {
//       if (scouts.length < 1) {
//         throw new Error('No scouts found');
//       }

//       var prices = _.map(scouts, function (scout) {
//         return scout.registrations[0].details[type]();
//       });

//       return Promise.all(prices);
//     })
//     .then(function (results) {
//       var cost = _.reduce(results, function (sum, result) {
//         return sum + result;
//       }, 0);

//       return res.status(status.OK).json({
//         cost: String(cost.toFixed(2))
//       });
//     })
//     .catch(function () {
//       return res.status(status.BAD_REQUEST).end();
//     });
// }
