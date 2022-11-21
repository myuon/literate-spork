import { css } from "@emotion/react";

const Loading = ({ progress }: { progress: number }) => {
  const r = 45;
  // It's hard to draw the perfect circle with path
  const x = 50 + r * Math.sin(1.999 * Math.PI);
  const y = 50 - r * Math.cos(1.999 * Math.PI);

  return (
    <svg viewBox="0 0 100 100">
      <circle
        cx="50"
        cy="50"
        r={r}
        fill="none"
        stroke="rgba(255, 255, 255, 0.15)"
        strokeWidth="3"
      />
      <path
        d={`M 50 5 A 45 45 0 1 1 ${x} ${y}`}
        fill="none"
        stroke="white"
        strokeWidth="3"
        css={css`
          stroke-dasharray: ${r * 2 * Math.PI};
          stroke-dashoffset: ${r * 2 * Math.PI * (1 - progress)};
          transition: all 0.3s linear;
        `}
      />
    </svg>
  );
};

export const Thumbnail = ({
  blob,
  alt,
  uploading,
  completed,
  uploadProgress,
}: {
  blob: Blob;
  alt: string;
  uploading?: boolean;
  completed?: boolean;
  uploadProgress?: number;
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
      {uploading && uploadProgress ? (
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
          <div
            css={css`
              width: 120px;
              height: 120px;
            `}
          >
            <Loading progress={uploadProgress} />
          </div>
        </div>
      ) : null}
      {completed ? (
        <div
          css={css`
            position: absolute;
            top: 8px;
            right: 8px;
            color: white;
          `}
        >
          ✅
        </div>
      ) : null}
    </div>
  );
};
