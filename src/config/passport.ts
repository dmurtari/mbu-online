import passport from 'passport';
import { ExtractJwt, Strategy as JwtStrategy, StrategyOptions } from 'passport-jwt';

import config from './secrets';
import { User } from '@models/user.model';

const options: StrategyOptions = {
    secretOrKey: config.APP_SECRET,
    jwtFromRequest: ExtractJwt.fromAuthHeaderWithScheme('jwt')
};

passport.use(new JwtStrategy(options, async (jwtPayload, done) => {
    try {
        const user: User = await User.findByPk(jwtPayload);
        if (!!user) {
            return done(null, (user as any).dataValues);
        } else {
            return done(null, false);
        }
    } catch (err) {
        return done(err, false);
    }
}));

