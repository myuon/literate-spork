import { css } from "@emotion/react";

export const Thumbnail = ({
  blob,
  alt,
  uploading,
  completed,
}: {
  blob: Blob;
  alt: string;
  uploading?: boolean;
  completed?: boolean;
}) => {
  const src = URL.createObjectURL(blob);

  return (
    <div
      css={css`
        position: relative;
      `}
    >
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
      {uploading ? (
        <div
          css={css`
            position: absolute;
            top: 0;
            left: 0;
            display: grid;
            place-items: center;
            width: 100%;
            height: 100%;
            color: white;
            background-color: rgba(0, 0, 0, 0.5);
            border-radius: 8px;
          `}
        >
          UPLOADING...
        </div>
      ) : null}
      {completed ? (
        <div
          css={css`
            position: absolute;
            top: 0;
            left: 0;
            display: grid;
            place-items: center;
            width: 100%;
            height: 100%;
            color: white;
            background-color: rgba(0, 0, 0, 0.5);
            border-radius: 8px;
          `}
        >
          ✅
        </div>
      ) : null}
    </div>
  );
};
