import {Banner} from '@shopify/polaris';
import React from 'react';

export function BannerComponent({ title, tone }) {
  return (
    <Banner
      title={title}
      tone={tone}
      onDismiss={() => {}}
    />
  );
}