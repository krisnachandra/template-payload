import type { CollectionConfig } from 'payload/types';

import path from 'path';

import type { Media as MediaType } from '../../payload-types';

import { admins, anyone } from '../../access';
import { richTextSlate } from '../../fields';
import { getPlaiceholder } from '../../utilities';

export const Media: CollectionConfig = {
  slug: `media`,
  admin: {
    defaultColumns: [`filename`, `alt`, `filesize`, `mimeType`, `createdAt`, `updatedAt`],
  },
  hooks: {
    beforeChange: [
      // Plaiceholder hooks
      async ({ req, data }) => {
        try {
          const { base64 } = await getPlaiceholder(Buffer.from(req.files.file.data), {
            size: 8,
            removeAlpha: true,
          });

          return { ...data, base64 };
        } catch (e) {
          req.payload.logger.warn(e.message);
          return data;
        }
      },
    ],
  },
  access: {
    read: anyone,
    update: admins,
    create: admins,
    delete: admins,
  },
  upload: {
    staticDir: path.resolve(__dirname, `../../../../media`),
    mimeTypes: [`image/*`, `application/pdf`, `video/*`, `application/x-mpegURL`],
    adminThumbnail: ({ doc }) => {
      const media = doc as unknown as MediaType;
      if (
        typeof media.sizes == `object` &&
        typeof media.sizes.thumbnail == `object` &&
        media.sizes.thumbnail.url
      ) {
        return media.sizes.thumbnail.url;
      }

      if (String(media.mimeType).includes(`image`)) {
        return media.url;
      }

      return undefined;
    },
    // TODO: open discussion for image sizes
    imageSizes: [
      {
        name: `thumbnail`,
        width: 175,
        height: 175,
        position: `centre`,
        withoutEnlargement: true,
      },
      {
        name: `medium`,
        width: 800,
        position: `centre`,
        withoutEnlargement: true,
      },
      {
        name: `large`,
        width: 1920,
        position: `centre`,
        withoutEnlargement: true,
      },
    ],
  },
  fields: [
    {
      name: `alt`,
      type: `text`,
      required: true,
    },
    {
      type: `row`,
      admin: {
        condition: data => {
          if (data.mimeType) {
            return data.mimeType.includes(`image`);
          }

          return false;
        },
      },
      fields: [
        {
          name: `blur`,
          type: `checkbox`,
          defaultValue: true,
        },
        {
          name: `optimize`,
          type: `checkbox`,
          defaultValue: true,
        },
      ],
    },
    richTextSlate({
      name: `caption`,
      elements: [`link`],
      localized: true,
    }),
    {
      name: `base64`,
      type: `text`,
      admin: {
        hidden: true,
      },
    },
  ],
};
