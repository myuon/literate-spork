import "./App.css";
import { css } from "@emotion/react";
import { useRef, useState } from "react";

const DropArea = ({ onChange }: { onChange: () => void }) => {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <>
      <input
        type="file"
        multiple
        accept="image/*"
        css={css`
          display: none;
        `}
        ref={inputRef}
        onChange={() => {
          onChange();
        }}
      />
      <div
        role="button"
        tabIndex={0}
        data-dragging={isDragging}
        css={[
          css`
            display: grid;
            place-items: center;
            min-height: 160px;
            color: rgba(0, 0, 0, 0.6);
            cursor: pointer;
            border: 2px dashed rgba(0, 0, 0, 0.2);
            border-radius: 8px;
          `,
          css`
            &[data-dragging="true"] {
              border-color: rgba(0, 0, 0, 0.6);
            }
          `,
        ]}
        onClick={() => {
          inputRef.current?.click();
        }}
        onKeyDown={() => {
          inputRef.current?.click();
        }}
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
          onChange();
        }}
      >
        Drop files here OR click to select files
      </div>
    </>
  );
};

const styles = {
  resetButton: css`
    padding: 0;
    font: inherit;
    color: inherit;
    cursor: pointer;
    background: none;
    border: none;
  `,
};

function App() {
  return (
    <div className="App">
      <DropArea
        onChange={() => {
          console.log("change");
        }}
      />
      <button
        css={[
          styles.resetButton,
          css`
            padding: 8px 16px;
            border: 1px solid rgba(0, 0, 0, 0.2);
            border-radius: 8px;
          `,
        ]}
      >
        SELECT FILES
      </button>
    </div>
  );
}

export default App;
