import { startCase } from 'lodash';

import { generateMJML } from './generate-mjml';

export const emailDefault = ({ data }: { data: Record<string, any> }) => {
  // Format email content
  let html = ``;
  for (const key in data) {
    html += `${startCase(key)}: ${data[key]}`;
    html += `<br/>`;
  }

  return generateMJML({
    mjmlBody: `
    <mj-text mj-class="h1">You have a new email</mj-text>

    <mj-text>${html}</mj-text>
    `,
  });
};
