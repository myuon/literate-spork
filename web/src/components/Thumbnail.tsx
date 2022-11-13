import { css } from "@emotion/react";

export const Thumbnail = ({ blob, alt }: { blob: Blob; alt: string }) => {
  const src = URL.createObjectURL(blob);

  return (
    <img
      src={src}
      alt={alt}
      css={css`
        width: 100%;
        aspect-ratio: 1;
        background-color: #eee;
        border-radius: 8px;
        object-fit: cover;
      `}
      onLoad={() => {
        URL.revokeObjectURL(src);
      }}
    />
  );
};
