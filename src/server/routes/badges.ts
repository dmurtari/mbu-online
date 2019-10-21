import { Router } from 'express';

import { isAuthorized } from '@middleware/isAuthorized';
import { UserRole } from '@interfaces/user.interface';
import { createBadge } from '@routes/badges/postBadges';
import { getBadges } from '@routes/badges/getBadges';
import { deleteBadge } from '@routes/badges/deleteBadges';
import { updateBadge } from '@routes/badges/updateBadges';

export const badgeRoutes = Router();

badgeRoutes.post('/', isAuthorized([UserRole.TEACHER]), createBadge);
badgeRoutes.get('/', getBadges);
badgeRoutes.delete('/:id', isAuthorized([UserRole.TEACHER]), deleteBadge);
badgeRoutes.put('/:id', isAuthorized([UserRole.TEACHER]), updateBadge);
