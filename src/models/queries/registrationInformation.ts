import { FindOptions } from 'sequelize';

import { Scout } from '@models/scout.model';
import { Offering } from '@models/offering.model';
import { Badge } from '@models/badge.model';
import { Purchasable } from '@models/purchasable.model';

export default <FindOptions>{
    attributes: {
        include: [['id', 'registration_id'], 'created_at', 'updated_at', 'scout_id', 'event_id'],
        exclude: ['projectedCost', 'actualCost']
    },
    include: [
        {
            model: Scout,
            as: 'scout',
            attributes: [['id', 'scout_id'], 'firstname', 'lastname', 'troop', 'notes']
        }, {
            model: Offering,
            as: 'preferences',
            attributes: [['id', 'offering_id'], 'duration', 'periods', 'price'],
            through: {
                as: 'details',
                attributes: ['rank']
            },
            include: [{
                model: Badge,
                as: 'badge',
                attributes: ['name']
            }]
        }, {
            model: Offering,
            as: 'assignments',
            attributes: [['id', 'offering_id'], 'price'],
            through: {
                as: 'details',
                attributes: ['periods', 'completions']
            },
            include: [{
                model: Badge,
                as: 'badge',
                attributes: ['name']
            }]
        }, {
            model: Purchasable,
            as: 'purchases',
            attributes: [['id', 'purchasable_id'], 'item', 'price', 'has_size'],
            through: {
                as: 'details',
                attributes: ['size', 'quantity']
            },
        }
    ]
};
