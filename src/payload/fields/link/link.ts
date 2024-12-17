import type { Field } from 'payload/types';

import deepMerge from '../../utilities/deep-merge';
import { ArchiveLink } from './archive-link';

export type LinkType = (options?: {
  appearanceDefaultValue?: string;
  appearances?: { label: string; value: string }[] | false | string[];
  disableLabel?: boolean;
  name?: string;
  overrides?: Record<string, unknown>;
}) => Field;

export const link: LinkType = ({
  name,
  appearances,
  appearanceDefaultValue,
  disableLabel = false,
  overrides = {},
} = {}) => {
  const linkResult: Field = {
    name: name || `link`,
    type: `group`,
    admin: {
      hideGutter: true,
    },
    fields: [
      {
        type: `row`,
        fields: [
          {
            name: `type`,
            type: `radio`,
            defaultValue: `reference`,
            options: [
              {
                label: `Internal link`,
                value: `reference`,
              },
              {
                label: `Archive Link`,
                value: `archive`,
              },
              {
                label: `Custom URL`,
                value: `custom`,
              },
            ],
            admin: {
              layout: `horizontal`,
              width: `50%`,
            },
          },
          {
            name: `newTab`,
            label: `Open in new tab`,
            type: `checkbox`,
            admin: {
              width: `50%`,
              style: {
                alignSelf: `flex-end`,
              },
            },
          },
        ],
      },
    ],
  };

  const linkTypes: Field[] = [
    {
      name: `reference`,
      label: `Document to link to`,
      type: `relationship`,
      // TODO: add your collections here for document link
      relationTo: [`pages`, `blogs`],
      required: true,
      maxDepth: 1,
      admin: {
        condition: (_, siblingData) => siblingData?.type === `reference`,
      },
    },
    {
      name: `archive`,
      label: `Archive to link to`,
      type: `text`,
      admin: {
        components: {
          Field: ArchiveLink,
        },
        condition: (_, siblingData) => siblingData?.type === `archive`,
      },
    },
    {
      name: `url`,
      label: `Custom URL`,
      type: `text`,
      required: true,
      admin: {
        condition: (_, siblingData) => siblingData?.type === `custom`,
      },
    },
  ];

  if (!disableLabel) {
    linkTypes.map(linkType => ({
      ...linkType,
      admin: {
        ...linkType.admin,
        width: `50%`,
      },
    }));

    linkResult.fields.push({
      type: `row`,
      fields: [
        ...linkTypes,
        {
          name: `label`,
          label: `Label`,
          type: `text`,
          required: true,
          localized: true,
          admin: {
            width: `50%`,
          },
        },
      ],
    });
  } else {
    linkResult.fields = [...linkResult.fields, ...linkTypes];
  }

  if (appearances) {
    linkResult.fields.push({
      name: `appearance`,
      type: `select`,
      options: appearances,
      defaultValue: appearanceDefaultValue,
      admin: {
        description: `Choose how the link should be rendered.`,
      },
    });
  }

  return deepMerge(linkResult, overrides);
};
