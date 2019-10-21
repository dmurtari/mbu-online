import { Router } from 'express';

import { forgot , reset } from '@routes/forgot/postForgot';
import { tokenValid } from '@routes/forgot/getForgot';

export const forgotPasswordRoutes = Router();

forgotPasswordRoutes.post('/forgot', forgot);
forgotPasswordRoutes.get('/reset/:token', tokenValid);
forgotPasswordRoutes.post('/reset', reset);

