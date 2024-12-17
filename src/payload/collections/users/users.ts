import type { CollectionConfig } from 'payload/types';

import { admins, adminsAndUser } from '../../access';
import { emailForgotPassword } from '../../mjml';
import { ensureFirstUserIsAdmin, loginAfterCreate } from './hooks';

export const Users: CollectionConfig = {
  slug: `users`,
  admin: {
    useAsTitle: `name`,
    defaultColumns: [`name`, `email`, `roles`, `createdAt`, `updatedAt`],
  },
  access: {
    read: adminsAndUser,
    create: admins,
    update: adminsAndUser,
    delete: admins,
    admin: admins,
  },
  hooks: {
    afterChange: [loginAfterCreate],
  },
  auth: {
    forgotPassword: {
      generateEmailSubject: () => {
        return `Reset Password - ${process.env.PAYLOAD_PUBLIC_SITE_NAME}`;
      },
      generateEmailHTML: ({ token }) => {
        return emailForgotPassword({
          link: `${process.env.PAYLOAD_PUBLIC_SERVER_URL}/admin/reset/${token}`,
        });
      },
    },
  },
  fields: [
    {
      name: `name`,
      type: `text`,
    },
    {
      name: `roles`,
      type: `select`,
      hasMany: true,
      defaultValue: [`user`],
      options: [
        {
          label: `admin`,
          value: `admin`,
        },
        {
          label: `user`,
          value: `user`,
        },
      ],
      hooks: {
        beforeChange: [ensureFirstUserIsAdmin],
      },
      access: {
        read: admins,
        create: admins,
        update: admins,
      },
    },
  ],
  timestamps: true,
};
