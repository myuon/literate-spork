import { css } from "@emotion/react";
import { PropsWithChildren, useRef, useState } from "react";

const DropArea = ({
  onDrop,
  children,
}: PropsWithChildren<{ onDrop: (files: FileList) => void }>) => {
  const [isDragging, setIsDragging] = useState(false);

  return (
    <>
      <div
        data-dragging={isDragging}
        css={[
          css`
            display: grid;
            place-items: center;
            min-height: 160px;
            color: rgba(0, 0, 0, 0.6);
            cursor: pointer;
            border: 2px dashed #ddd;
            border-radius: 8px;
          `,
          css`
            &[data-dragging="true"] {
              background-color: #e9e9e9;
              border-color: rgba(0, 0, 0, 0.6);
            }
          `,
        ]}
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={(event) => {
          event.preventDefault();
          setIsDragging(false);
        }}
        onDrop={(event) => {
          event.preventDefault();
          setIsDragging(false);
          onDrop(event.dataTransfer.files);
        }}
      >
        {children}
      </div>
    </>
  );
};

export const SelectFiles = ({
  onChange,
}: {
  onChange: (files: File[]) => void;
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => {
        inputRef.current?.click();
      }}
      onKeyDown={() => {
        inputRef.current?.click();
      }}
    >
      <input
        type="file"
        multiple
        accept="image/*"
        css={css`
          display: none;
        `}
        ref={inputRef}
        onChange={(event) => {
          event.preventDefault();
          onChange(Array.from(event.currentTarget.files ?? []));
        }}
      />
      <DropArea
        onDrop={(files) => {
          onChange(
            Array.from(files).filter((f) => f.type.startsWith("image/"))
          );
        }}
      >
        Drop files here OR click here to select files
      </DropArea>
    </div>
  );
};
