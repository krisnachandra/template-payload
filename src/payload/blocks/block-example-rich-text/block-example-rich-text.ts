import type { Block } from 'payload/types';

import { richTextSlate, sectionID } from '../../fields';
import Image from './preview.jpg';

export const blockExampleRichText: Block = {
  slug: `block-example-rich-text`,
  imageURL: `${Image}`,
  fields: [
    sectionID(),
    richTextSlate({
      name: `content`,
      localized: true,
    }),
  ],
};
