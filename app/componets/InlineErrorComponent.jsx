import {InlineError} from '@shopify/polaris';
import React from 'react';

export function InlineErrorComponent({ msg }) {
  // return <InlineError message={msg} fieldID="myFieldID" />;
  return ( <div
              style={{
                color: "red",
                fontSize: "11px",
                marginTop: "4px",
                whiteSpace: "normal",
                wordWrap: "break-word",
                maxWidth: "225px",
              }}
              dangerouslySetInnerHTML={{ __html: msg }}
                    />);
}