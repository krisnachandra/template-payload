import type { GenerateTitle } from '@payloadcms/plugin-seo/types';

import { webpackBundler } from '@payloadcms/bundler-webpack';
import { mongooseAdapter } from '@payloadcms/db-mongodb';
import nestedDocs from '@payloadcms/plugin-nested-docs';
import seo from '@payloadcms/plugin-seo';
import { slateEditor } from '@payloadcms/richtext-slate';
import dotenv from 'dotenv';
import path from 'path';
import { buildConfig } from 'payload/config';

import type { Config } from './payload-types';

import { Blogs, Categories, Media, Pages, Users } from './collections';
import { BeforeDashboard, BeforeLogin, Icon, Logo, NoRobots } from './components';
import { email, getSlugs } from './endpoints';
import { ArchiveBlog, Footer, Header, Settings } from './globals';
import { slugHandler } from './modules/slug-handler';

declare module 'payload' {
  // @ts-expect-error: duplicate interface
  export interface GeneratedTypes extends Config {}
}

const generateTitle: GenerateTitle = () => {
  return process.env.PAYLOAD_PUBLIC_SITE_NAME || `Kesato PayloadCMS`;
};

const generateConfigUrls = () => {
  const urls: string[] = [];
  const serverUrl = process.env.PAYLOAD_PUBLIC_SERVER_URL;
  const frontendUrl = process.env.PAYLOAD_PUBLIC_FRONTEND_URL;

  if (typeof serverUrl === `string` && serverUrl.length > 0) {
    urls.push(serverUrl);
  }

  if (typeof frontendUrl === `string` && frontendUrl.length > 0) {
    urls.push(frontendUrl);
  }

  return urls;
};

const getLocaleDefault = () => {
  return process.env.PAYLOAD_PUBLIC_LOCALE_DEFAULT || `en`;
};

const getLocales = () => {
  const locales: Array<{ code: string; label: string }> = [];
  let envLocale = process.env.PAYLOAD_PUBLIC_LOCALE_LIST;

  if (!envLocale || envLocale.length < 0) {
    envLocale = `en:English`;
  }

  envLocale.split(` `).forEach(item => {
    const locale = item.split(`:`);
    locales.push({
      code: locale[0],
      label: locale[1],
    });
  });

  return locales;
};

dotenv.config({
  path: path.resolve(__dirname, `../../.env`),
});

export default buildConfig({
  db: mongooseAdapter({
    url: process.env.DATABASE_URI,
  }),
  editor: slateEditor({}),
  admin: {
    bundler: webpackBundler(),
    webpack: config => ({
      ...config,
      resolve: {
        ...config.resolve,
        alias: {
          ...config.resolve.alias,
          [path.resolve(__dirname, `utilities/plaiceholder`)]: path.resolve(
            __dirname,
            `empty-module-mock.js`,
          ),
          [path.resolve(__dirname, `mjml/generate-mjml`)]: path.resolve(
            __dirname,
            `empty-module-mock.js`,
          ),
        },
      },
    }),
    user: Users.slug,
    components: {
      graphics: {
        Icon,
        Logo,
      },
      beforeLogin: [
        NoRobots,
        // TODO: delete after live
        // The `BeforeLogin` component renders a message that you see while logging into your admin panel.
        // Feel free to delete this at any time. Simply remove the line below and the import `BeforeLogin` statement on line 15.
        BeforeLogin,
      ],
      beforeDashboard: [
        // The `BeforeDashboard` component renders the 'welcome' block that you see after logging into your admin panel.
        // Feel free to delete this at any time. Simply remove the line below and the import `BeforeDashboard` statement on line 14.
        BeforeDashboard,
      ],
    },
    meta: {
      favicon: `/favicon.ico`,
      ogImage: `/favicon.ico`,
      titleSuffix: ` - ${process.env.PAYLOAD_PUBLIC_SITE_NAME}`,
    },
  },
  email: process.env.SMTP_HOST
    ? {
        fromName: process.env.PAYLOAD_PUBLIC_SITE_NAME,
        fromAddress: process.env.SMTP_FROM_EMAIL,
        transportOptions: {
          host: process.env.SMTP_HOST,
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          },
          port: Number(process.env.SMTP_PORT),
          secure: process.env.SMTP_SECURE == `true`,
          requireTLS: process.env.SMTP_REQUIRE_TLS == `true`,
        },
      }
    : undefined,
  endpoints: [
    {
      path: `/custom/email`,
      method: `post`,
      handler: email,
    },
    {
      path: `/custom/:collections/get-slugs`,
      method: `get`,
      handler: getSlugs,
    },
  ],
  express: {
    preMiddleware: [
      // inject id of homepage
      async (req, _res, next) => {
        try {
          let homepage = null;
          homepage = await req.payload
            .findGlobal({
              slug: `settings`,
            })
            .then(e => e.homePage.id || null);
          req.payload.config.custom = { homepage };
          next();
        } catch (error) {
          next();
        }
      },
    ],
  },
  serverURL: process.env.PAYLOAD_PUBLIC_SERVER_URL,
  collections: [Pages, Blogs, Categories, Media, Users],
  globals: [ArchiveBlog, Settings, Header, Footer],
  localization: {
    defaultLocale: getLocaleDefault(),
    locales: getLocales(),
    fallback: true,
  },
  typescript: {
    declare: false,
    outputFile: path.resolve(__dirname, `payload-types.ts`),
  },
  graphQL: {
    // disabled by default as we rarely use it
    disable: true,
    schemaOutputFile: path.resolve(__dirname, `generated-schema.graphql`),
  },
  cors: process.env.NODE_ENV === `production` ? generateConfigUrls() : `*`,
  csrf: process.env.NODE_ENV === `production` ? generateConfigUrls() : [],
  rateLimit: {
    skip: () => true,
  },
  plugins: [
    // TODO: Not apply in NextJS
    // redirects({
    //   collections: [`pages`, `blogs`],
    // }),
    nestedDocs({
      collections: [`categories`],
    }),
    seo({
      collections: [`pages`, `blogs`],
      globals: [`archive-blog`],
      generateTitle,
      uploadsCollection: `media`,
    }),
    slugHandler({
      collections: [`pages`, `blogs`],
    }),
  ],
});
