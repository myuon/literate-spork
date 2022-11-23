import "./App.css";
import { css } from "@emotion/react";
import { useRef, useState } from "react";
import { SelectFiles } from "./components/SelectFiles";
import { Thumbnail } from "./components/Thumbnail";
import { Button } from "./components/Button";
import { useTaskQueue } from "./components/useTaskQueue";

const upload = async (
  xhr: XMLHttpRequest,
  file: File,
  onProgress?: (value: number) => void
) => {
  return new Promise<void>((resolve, reject) => {
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

  const xhrInProgress = useRef<Record<number, XMLHttpRequest>>({});
  const { start, isRunning, clearTaskQueue } = useTaskQueue({
    semaphoreSize: 3,
  });

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
          gap: 16px;
          justify-content: flex-end;
        `}
      >
        {isRunning && (
          <Button
            onClick={async () => {
              clearTaskQueue();
              Object.values(xhrInProgress.current).forEach((xhr) => {
                xhr.abort();
              });
              xhrInProgress.current = {};
            }}
          >
            Abort
          </Button>
        )}
        <Button
          disabled={isRunning}
          onClick={async () => {
            start(
              images.map(() => false),
              async (index: number) => {
                const xhr = new XMLHttpRequest();

                updateImage(index, (image: Image) => {
                  image.status = "uploading";
                  return image;
                });

                xhrInProgress.current[index] = xhr;

                await upload(xhr, images[index].file, (value) => {
                  updateImage(index, (image: Image) => {
                    image.uploadProgress = value;
                    return image;
                  });
                });

                delete xhrInProgress.current[index];

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
