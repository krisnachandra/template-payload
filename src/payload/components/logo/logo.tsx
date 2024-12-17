import React from 'react';

export const Logo: React.FC = () => {
  return (
    <img
      alt={process.env.PAYLOAD_PUBLIC_SITE_NAME}
      src={`${process.env.PAYLOAD_PUBLIC_SERVER_URL}/logo.svg`}
      width={250}
    />
  );
};
