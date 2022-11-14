import { css } from "@emotion/react";
import React from "react";

const resetButtonStyle = css`
  padding: 0;
  font-family: inherit;
  font-size: inherit;
  font-weight: inherit;
  text-align: inherit;
  cursor: pointer;
  background: none;
  border: none;
`;

export const Button = (props: React.ComponentPropsWithoutRef<"button">) => {
  return (
    <button
      {...props}
      css={[
        resetButtonStyle,
        css`
          display: grid;
          place-items: center;
          min-width: 100px;
          padding: 8px 16px;
          font-weight: 500;
          background-color: #f9f9f9;
          border: 1px solid transparent;
          border-radius: 8px;
          transition: all 0.2s ease-out;

          &:hover {
            border: 1px solid rgba(0, 0, 0, 0.15);
          }
          &:active {
            background-color: #e9e9e9;
          }
        `,
      ]}
    />
  );
};
