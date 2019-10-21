import { Router } from 'express';

import { getIndex } from '@routes/index/getIndex';

export const indexRoutes = Router();

indexRoutes.get('/', getIndex);

