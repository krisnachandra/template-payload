import type { Access } from 'payload/types';

import { checkRole } from '../utilities';

export const adminsAndUser: Access = ({ req: { collection, user } }) => {
  if (user) {
    // Admin can read all data
    if (checkRole([`admin`], user)) {
      return true;
    }

    // For collection users, where field id = user.id
    if (collection.config.slug === `users`) {
      return {
        id: user.id,
      };
    }

    // For others collection, where field user = user.id
    return {
      user: {
        equals: user.id,
      },
    };
  }

  return false;
};
