import supertest from 'supertest';
import { Sequelize } from 'sequelize';
import * as async from 'async';
import status from 'http-status-codes';
import _ from 'lodash';

import app from '@app/app';
import { User } from '@models/user.model';
import { sequelize } from '@app/sequelize';
import testEvents from './testEvents';
import testBadges from './testBadges';
import testPurchasables from './testPurchasables';
import { UserInterface, SignupRequestInterface, UserRole } from '@interfaces/user.interface';
import { Model } from 'sequelize-typescript';
import { ScoutInterface } from '@interfaces/scout.interface';
import { Scout } from '@models/scout.model';

const request = supertest(app);

export interface TokenObject {
    token: string;
    profile: UserInterface;
}

export interface RoleTokenObjects {
    [role: string]: TokenObject;
}

export default class TestUtils {

    public static badId: string = '6575';

    public static async dropDb(): Promise<Sequelize> {
        return sequelize.sync({ force: true });
    }

    public static async dropTable(models: typeof Model[]): Promise<any> {
        return Promise.all(
            models.map(model => model.sync({ force: true }))
        );
    }

    public static async generateTokens(
        roles: UserRole[] = [UserRole.ADMIN, UserRole.TEACHER, UserRole.COORDINATOR]
    ): Promise<RoleTokenObjects> {
        const tokens: RoleTokenObjects = {};

        for await (const role of roles) {
            const { token, profile } = await this.generateToken(role);
            tokens[role] = { token, profile };
        }

        return tokens;
    }

    public static async generateToken(name: string): Promise<TokenObject> {
        let token: string;
        let profile: UserInterface;

        const roleSearchRegexp: RegExp = /(\D+)/;
        const role = roleSearchRegexp.exec(name)[1];
        const postData: SignupRequestInterface = {
            email: name + '@test.com',
            password: 'password',
            firstname: 'firstname',
            lastname: 'lastname',
            role: role
        };

        await request.post('/api/signup')
        .send(postData)
        .expect(status.CREATED)
        .expect((res) => {
            profile = res.body.profile;
                token = res.body.token;
            });

        const user: User = await User.findByPk(profile.id);

        user.approved = true;
        await user.save();

        return {
            token,
            profile
        };
    }

    public static async removeScoutsForUser(generatedUser: TokenObject): Promise<unknown> {
        const user: User = await User.findByPk(generatedUser.profile.id);
        return user.$set('scouts', []);
    }

    public static async createScoutsForUser(generatedUser: TokenObject, scouts: ScoutInterface[]): Promise<Scout[]> {
        const user: User = await User.findByPk(generatedUser.profile.id);
        const createdScouts: Scout[] = [];

        await Promise.all(scouts.map(async (scout) => {
            const createdScout: Scout = await Scout.create(scout);
            createdScouts.push(createdScout);
            return user.$add('scout', createdScout);
        }));

        return createdScouts;
    }

    // createScoutsForUser: function (user, scouts, token, done) {
    //     var createdScouts = [];
    //     Models.User.findById(user.profile.id)
    //         .then(function (userFromDb) {
    //             async.forEachOfSeries(scouts, function (scout, index, cb) {
    //                 Models.Scout.create(scout)
    //                     .then(function (scout) {
    //                         return userFromDb.addScouts(scout.id);
    //                     })
    //                     .then(function () {
    //                         return cb();
    //                     })
    //                     .catch(function (err) {
    //                         throw new Error('Unable to create scout', err);
    //                     });
    //             }, function (err) {
    //                 if (err) return done(err);
    //                 return Models.User.findById(user.profile.id, {
    //                     include: [{
    //                         model: Models.Scout,
    //                         as: 'scouts'
    //                     }]
    //                 })
    //                     .then(function (userFromDb) {
    //                         _.forEach(userFromDb.scouts, function (scout) {
    //                             createdScouts.push(scout.toJSON());
    //                         });
    //                         return done(null, createdScouts);
    //                     });
    //             });
    //         });
    // },
    // createBadges: function (token, done) {
    //     var badges = [];
    //     async.forEachOfSeries(testBadges, function (item, index, cb) {
    //         request.post('/api/badges')
    //             .set('Authorization', token)
    //             .send(item)
    //             .expect(status.CREATED)
    //             .end(function (err, res) {
    //                 if (err) return done(err);
    //                 badges.push({
    //                     id: res.body.badge.id,
    //                     badge: item
    //                 });
    //                 return cb();
    //             });
    //     }, function (err) {
    //         done(err, badges);
    //     });
    // },
    // createEvents: function (token, done) {
    //     var events = [];
    //     async.forEachOfSeries(testEvents, function (item, index, cb) {
    //         request.post('/api/events')
    //             .set('Authorization', token)
    //             .send(item)
    //             .expect(status.CREATED)
    //             .end(function (err, res) {
    //                 if (err) return done(err);
    //                 events.push({
    //                     id: res.body.event.id,
    //                     event: item
    //                 });
    //                 return cb();
    //             });
    //     }, function (err) {
    //         done(err, events);
    //     });
    // },
    // createOfferingsForEvent: function (event, badges, offering, token, done) {
    //     var offerings = [];
    //     async.forEachOfSeries(badges, function (item, index, cb) {
    //         var postData = {};
    //         postData.badge_id = item.id;
    //         postData.offering = offering;
    //         request.post('/api/events/' + event.id + '/badges')
    //             .set('Authorization', token)
    //             .send(postData)
    //             .expect(status.CREATED)
    //             .end(function (err, res) {
    //                 if (err) return done(err);
    //                 offerings = _.map(res.body.event.offerings, function (offering) {
    //                     return {
    //                         id: offering.details.id,
    //                         offering: offering.details
    //                     };
    //                 });
    //                 return cb();
    //             });
    //     }, function (err) {
    //         done(err, offerings);
    //     });
    // },
    // createPurchasablesForEvent: function (eventId, done) {
    //     var purchasables = [];
    //     async.forEachOfSeries(testPurchasables, function (item, index, cb) {
    //         var purchasable;
    //         Models.Purchasable.create(item)
    //             .then(function (createdPurchasable) {
    //                 purchasable = createdPurchasable;
    //                 return Models.Event.findById(eventId);
    //             })
    //             .then(function (event) {
    //                 return event.addPurchasable(purchasable);
    //             })
    //             .then(function () {
    //                 return cb();
    //             })
    //             .catch(function (err) {
    //                 return done(err);
    //             });
    //     }, function (err) {
    //         if (err) return done(err);
    //         return Models.Event.findById(eventId, {
    //             include: [{
    //                 model: Models.Purchasable,
    //                 as: 'purchasables'
    //             }]
    //         })
    //             .then(function (event) {
    //                 _.forEach(event.purchasables, function (purchasable) {
    //                     purchasables.push(purchasable.toJSON());
    //                 });
    //                 return done(null, purchasables);
    //             });
    //     });
    // },

    // registerScoutsForEvent: function (eventId, scoutIds, token, done) {
    //     var registrationIds = [];
    //     async.forEachOfSeries(scoutIds, function (scoutId, index, cb) {
    //         request.post('/api/scouts/' + scoutId + '/registrations')
    //             .set('Authorization', token)
    //             .send({
    //                 event_id: eventId
    //             })
    //             .expect(status.CREATED)
    //             .end(function (err, res) {
    //                 if (err) return cb(err);
    //                 registrationIds.push(res.body.registration.id);
    //                 return cb();
    //             });
    //     }, function (err) {
    //         done(err, registrationIds);
    //     });
    // },
    // }
}
