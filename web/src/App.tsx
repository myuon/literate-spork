import "./App.css";
import { css } from "@emotion/react";
import { useState } from "react";
import { SelectFiles } from "./components/SelectFiles";

function App() {
  const [images, setImages] = useState<string[]>([]);

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
          const reader = new FileReader();

          files.forEach((file) => {
            reader.addEventListener("load", (event) => {
              const result = event.target?.result;
              if (result) {
                setImages((images) => [...images, result as string]);
              }
            });
            reader.readAsDataURL(file);
          });
          console.log(files);
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
            <img
              src={image}
              alt={`${index}`}
              css={css`
                width: 100%;
                aspect-ratio: 1;
                border-radius: 8px;
                object-fit: cover;
              `}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
