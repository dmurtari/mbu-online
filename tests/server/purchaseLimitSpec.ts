import supertest from 'supertest';
import { expect } from 'chai';
import status from 'http-status-codes';

import app from '@app/app';
import TestUtils, { RoleTokenObjects } from '@test/server/testUtils';
import { Event } from '@models/event.model';
import { Scout } from '@models/scout.model';
import testScouts from '@test/server/testScouts';
import { Purchasable } from '@models/purchasable.model';
import { Purchase } from '@models/purchase.model';
import { Registration } from '@models/registration.model';
import { RegistrationRequestDto, CreateRegistrationResponseDto } from '@interfaces/registration.interface';
import { SuperTestResponse } from '@test/helpers/supertest.interface';
import { CreatePurchasableDto, CreatePurchasablesResponseDto } from '@interfaces/purchasable.interface';
import { EventsResponseDto } from '@interfaces/event.interface';
import { CreatePurchaseRequestDto } from '@interfaces/purchase.interface';

const request = supertest(app);

describe.only('purchasable purchaser limits', () => {
    let generatedUsers: RoleTokenObjects;
    let generatedEvents: Event[];
    let generatedScouts: Scout[];
    let registrationIds: Map<number, number>;

    before(async () => {
        await TestUtils.dropDb();
    });

    before(async () => {
        generatedUsers = await TestUtils.generateTokens();
    });

    beforeEach(async ()=> {
        await TestUtils.dropTable([Scout, Event, Purchasable, Purchase, Registration]);
    });

    beforeEach(async () => {
        generatedEvents = await TestUtils.createEvents();
        generatedScouts = await TestUtils.createScoutsForUser(generatedUsers.coordinator, testScouts(5));
    });

    beforeEach(async () => {
        registrationIds = new Map();

        await Promise.all(generatedScouts.map(scout => {
            return request.post(`/api/scouts/${scout.id}/registrations`)
                .set('Authorization', generatedUsers.coordinator.token)
                .send(<RegistrationRequestDto>{
                    event_id: generatedEvents[0].id
                })
                .expect(status.CREATED)
                .then((res: SuperTestResponse<CreateRegistrationResponseDto>) => {
                    registrationIds.set(scout.id, res.body.registration.id);
                })
                .catch((err) => {
                    throw new Error(err);
                });
        }));
    });

    after(async () => {
        await TestUtils.dropDb();
    });

    describe('when purchasable do not exist', () => {
        let postData: CreatePurchasableDto;

        beforeEach(() => {
            postData = {
                item: 'Test Item',
                price: 10
            }
        });

        it('should not create a purchaser limit by default', async () => {
            await request.post(`/api/events/${generatedEvents[0].id}/purchasables`)
                .set('Authorization', generatedUsers.admin.token)
                .send(postData)
                .expect(status.CREATED)
                .then((res: SuperTestResponse<CreatePurchasablesResponseDto>) => {
                    const purchasables = res.body.purchasables;
                    expect(purchasables).to.have.length(1);
                    expect(purchasables[0].item).to.equal('Test Item');
                    expect(purchasables[0].purchaser_limit).to.be.null;
                });
        });

        it('should be able to set a limit', async () => {
            postData.purchaser_limit = 10;

            await request.post(`/api/events/${generatedEvents[0].id}/purchasables`)
                .set('Authorization', generatedUsers.admin.token)
                .send(postData)
                .expect(status.CREATED)
                .then((res: SuperTestResponse<CreatePurchasablesResponseDto>) => {
                    const purchasables = res.body.purchasables;
                    expect(purchasables).to.have.length(1);
                    expect(purchasables[0].item).to.equal('Test Item');
                    expect(purchasables[0].purchaser_limit).to.equal(10);
                });
        });

        it('should not allow a negative limit', async () => {
            postData.purchaser_limit = -1;

            await request.post(`/api/events/${generatedEvents[0].id}/purchasables`)
                .set('Authorization', generatedUsers.admin.token)
                .send(postData)
                .expect(status.BAD_REQUEST);
        });

        it('should expect a number', async () => {
            postData.purchaser_limit = <any>'wrong';

            await request.post(`/api/events/${generatedEvents[0].id}/purchasables`)
                .set('Authorization', generatedUsers.admin.token)
                .send(postData)
                .expect(status.BAD_REQUEST);
        });
    });

    describe('when a purchasable exists with a size limit', () => {
        let purchasableId: number;

        beforeEach(async () => {
            const postData: CreatePurchasableDto = {
                item: 'Test Item',
                price: 10,
                purchaser_limit: 1
            };

            await request.post(`/api/events/${generatedEvents[0].id}/purchasables`)
                .set('Authorization', generatedUsers.admin.token)
                .send(postData)
                .expect(status.CREATED)
                .then((res: SuperTestResponse<CreatePurchasablesResponseDto>) => {
                    purchasableId = res.body.purchasables[0].id;
                });
        });

        it('should get the purchaser limit', async () => {
            await request.get(`/api/events?id=${generatedEvents[0].id}`)
                .expect(status.OK)
                .then((res: SuperTestResponse<EventsResponseDto>) => {
                    const event = res.body[0];

                    expect(event.purchasables.length).to.equal(1);
                    expect(event.purchasables[0].purchaser_limit).to.equal(1);
                });
        });

        it('should allow adding a purchase if under the limit', async () => {
            await request.post(`/api/scouts/${generatedScouts[0].id}/registrations/${registrationIds.get(generatedScouts[0].id)}/purchases`)
                .set('Authorization', generatedUsers.coordinator.token)
                .send(<CreatePurchaseRequestDto>{
                    purchasable: purchasableId,
                    quantity: 1
                })
                .expect(status.CREATED);
        });
    });
});
