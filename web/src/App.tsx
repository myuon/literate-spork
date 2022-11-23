import "./App.css";
import { css } from "@emotion/react";
import { useState } from "react";
import { SelectFiles } from "./components/SelectFiles";
import { Thumbnail } from "./components/Thumbnail";
import { Button } from "./components/Button";
import { useTaskQueue } from "./components/useTaskQueue";

const upload = async (file: File, onProgress?: (value: number) => void) => {
  return new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `/api/upload/${encodeURIComponent(file.name)}`);
    xhr.setRequestHeader("Content-Type", "application/octet-stream");
    xhr.upload.onprogress = (event) => {
      onProgress?.(event.loaded / event.total);
    };
    xhr.onload = () => {
      onProgress?.(1);
      resolve();
    };
    xhr.onerror = () => {
      reject();
    };
    xhr.send(file);
  });
};

interface Image {
  file: File;
  status: string;
  uploadProgress: number;
}

function App() {
  const [images, setImages] = useState<Image[]>([]);
  const updateImage = (index: number, updater: (image: Image) => Image) => {
    setImages((prev) => {
      const next = [...prev];
      next[index] = updater(next[index]);
      return next;
    });
  };

  const { start, isRunning } = useTaskQueue({ semaphoreSize: 3 });

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
          setImages((prev) => [
            ...prev,
            ...files.map((file) => ({
              file,
              status: "added",
              uploadProgress: 0,
            })),
          ]);
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
            <Thumbnail
              blob={image.file}
              alt={`${index}`}
              uploading={image.status === "uploading"}
              uploadProgress={image.uploadProgress}
              completed={image.status === "completed"}
            />
          </div>
        ))}
      </div>

      <div
        css={css`
          display: flex;
          justify-content: flex-end;
        `}
      >
        <Button
          disabled={isRunning}
          onClick={async () => {
            start(
              images.map(() => false),
              async (index: number) => {
                updateImage(index, (image: Image) => {
                  image.status = "uploading";
                  return image;
                });

                await upload(images[index].file, (value) => {
                  updateImage(index, (image: Image) => {
                    image.uploadProgress = value;
                    return image;
                  });
                });

                updateImage(index, (image: Image) => {
                  image.status = "completed";
                  return image;
                });
              }
            );
          }}
        >
          {isRunning ? "Uploading..." : "Upload"}
        </Button>
      </div>
    </div>
  );
}

export default App;
