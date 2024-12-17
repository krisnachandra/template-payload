import React from 'react';

export const Icon: React.FC = () => {
  return (
    <img
      alt={process.env.PAYLOAD_PUBLIC_SITE_NAME}
      src={`${process.env.PAYLOAD_PUBLIC_SERVER_URL}/icon.svg`}
      width="32"
    />
  );
};
