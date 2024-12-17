import type { RichTextElement, RichTextLeaf } from '@payloadcms/richtext-slate';
import type { RichTextField } from 'payload/dist/fields/config/types';

import { slateEditor } from '@payloadcms/richtext-slate';

import deepMerge from '../../utilities/deep-merge';
import { link } from '../link';
import { defaultElements } from './elements';
import { defaultLeaves } from './leaves';

type RichText = (
  overrides?: Partial<RichTextField>,
  additions?: {
    elements?: RichTextElement[];
    leaves?: RichTextLeaf[];
  },
) => RichTextField;

export const richText: RichText = (
  overrides,
  additions = {
    elements: undefined,
    leaves: undefined,
  },
) =>
  deepMerge<RichTextField, Partial<RichTextField>>(
    {
      name: `richText`,
      type: `richText`,
      required: false,
      hooks: {
        afterRead: [
          ({ value }) => {
            if (
              value &&
              value.length === 1 &&
              value[0].children &&
              value[0].children.length === 1 &&
              value[0].children[0].text === ``
            ) {
              return ``;
            }

            return value;
          },
        ],
      },
      editor: slateEditor({
        admin: {
          upload: {
            collections: {
              media: {
                fields: [
                  {
                    type: `richText`,
                    name: `caption`,
                    label: `Caption`,
                    editor: slateEditor({
                      admin: {
                        elements: [...defaultElements],
                        leaves: [...defaultLeaves],
                      },
                    }),
                  },
                  {
                    type: `radio`,
                    name: `alignment`,
                    label: `Alignment`,
                    options: [
                      {
                        label: `Left`,
                        value: `left`,
                      },
                      {
                        label: `Center`,
                        value: `center`,
                      },
                      {
                        label: `Right`,
                        value: `right`,
                      },
                    ],
                  },
                  {
                    name: `enableLink`,
                    type: `checkbox`,
                    label: `Enable Link`,
                  },
                  link({
                    disableLabel: false,
                    overrides: {
                      admin: {
                        condition: (_, data) => Boolean(data?.enableLink),
                      },
                    },
                  }),
                ],
              },
            },
          },
          elements: additions.elements ? additions.elements : defaultElements,
          leaves: additions.leaves ? additions.leaves : defaultLeaves,
        },
      }),
    },
    overrides || {},
  );
