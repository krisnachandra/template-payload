import type { PayloadHandler } from 'payload/config';

import payload from 'payload';

import { emailDefault } from '../mjml';

/**
 * req.body should look like this :
 * {
 *  recaptchaResponse: string // Optional if using recaptcha
 *  subject: Email Subject    // The email subject
 *  emailData: {}             // Email content
 * }
 */

export const email: PayloadHandler = async (req, res, next) => {
  try {
    // Validate recaptcha
    const recaptchaSecret = process.env.RECAPTCHA_SECRET_KEY;
    if (recaptchaSecret) {
      const response: {
        action?: string;
        challenge_ts?: string;
        'error-codes'?: any[];
        hostname?: string;
        score?: number;
        success: boolean;
      } = await fetch(
        `https://www.google.com/recaptcha/api/siteverify?secret=${recaptchaSecret}&response=${req.body.recaptchaResponse}`,
        {
          method: `POST`,
        },
      ).then(async response => response.json());

      if (!response.success) {
        res.status(403).send({ errors: [{ message: `Invalid recaptcha` }] });
        return;
      }
    }

    await payload.sendEmail({
      from: `${process.env.PAYLOAD_PUBLIC_SITE_NAME} <${process.env.SMTP_FROM_EMAIL}>`,
      to: process.env.SMTP_ADMIN_EMAIL,
      subject: req.body.subject,
      html: emailDefault({ data: req.body.emailData }),
    });

    res.json({ messsage: `Email sent` });
  } catch (error) {
    next(error);
  }
};
