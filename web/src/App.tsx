import "./App.css";
import { css } from "@emotion/react";
import { useState } from "react";
import { SelectFiles } from "./components/SelectFiles";

const Thumbnail = ({ blob, alt }: { blob: Blob; alt: string }) => {
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

function App() {
  const [images, setImages] = useState<File[]>([]);

  return (
    <div
      className="App"
      css={css`
        display: grid;
        gap: 32px;
      `}
    >
      <SelectFiles
        onChange={(files) => {
          setImages((prev) => [...prev, ...files]);
        }}
      />

      <div
        css={css`
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 24px;
        `}
      >
        {images.map((image, index) => (
          <div key={index}>
            <Thumbnail blob={image} alt={`${index}`} />
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
