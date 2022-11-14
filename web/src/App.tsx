import "./App.css";
import { css } from "@emotion/react";
import { useState } from "react";
import { SelectFiles } from "./components/SelectFiles";
import { Thumbnail } from "./components/Thumbnail";
import { Button } from "./components/Button";

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

      <div
        css={css`
          display: flex;
          justify-content: flex-end;
        `}
      >
        <Button>Submit</Button>
      </div>
    </div>
  );
}

export default App;
