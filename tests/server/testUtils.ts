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
import { BadgeInterface } from '@interfaces/badge.interface';
import { Badge } from '@models/badge.model';
import { EventInterface } from '@interfaces/event.interface';
import { Event } from '@models/event.model';
import { Offering } from '@models/offering.model';
import { OfferingInterface } from '@interfaces/offering.interface';

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
        for await (const model of models) {
            await model.sync({ force: true });
        }
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

        for await (const scout of scouts) {
            const createdScout: Scout = await Scout.create(scout);
            createdScouts.push(createdScout.toJSON() as Scout);
            await user.$add('scout', createdScout);
        }

        return createdScouts;
    }

    public static async createBadges(badges: BadgeInterface[] = testBadges): Promise<Badge[]> {
        const createdBadges: Badge[] = [];

        await Promise.all(badges.map(async (badge) => {
            const createdBadge: Badge = await Badge.create(badge);
            createdBadges.push(createdBadge);
        }));

        return createdBadges;
    }

    public static async createEvents(events: EventInterface[] = testEvents): Promise<Event[]> {
        const createdEvents: Event[] = [];

        await Promise.all(events.map(async (event) => {
            const createdEvent: Event = await Event.create(event);
            createdEvents.push(createdEvent);
        }));

        return createdEvents;
    }

    public static async createOfferingsForEvent(event: Event, badges: Badge[], offering: OfferingInterface): Promise<Offering[]> {
        for await (const badge of badges) {
             await event.$add('offering', badge.id, { through: offering }) as Offering[];
        }

        return await Offering.findAll({ where: { event_id: event.id }});
    }

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
