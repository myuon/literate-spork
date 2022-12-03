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

const genId = () => {
  return `${new Date().getTime()}-${Math.random().toFixed(5)}`;
};

interface Image {
  id: string;
  file: File;
  status: string;
  uploadProgress: number;
}

function App() {
  const [images, setImages] = useState<Record<string, Image>>({});
  const updateImage = (id: string, updater: (image: Image) => Image) => {
    setImages((prev) => {
      const next = { ...prev };
      next[id] = updater(next[id]);
      return next;
    });
  };

  const xhrInProgress = useRef<Record<string, XMLHttpRequest>>({});
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
          const images = files.map((file) => ({
            id: genId(),
            file,
            status: "added",
            uploadProgress: 0,
          }));

          setImages((prev) => ({
            ...prev,
            ...Object.fromEntries(images.map((image) => [image.id, image])),
          }));
        }}
      />

      <div
        css={css`
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 24px;
        `}
      >
        {Object.values(images).map((image) => (
          <div key={image.id}>
            <Thumbnail
              blob={image.file}
              alt={`${image.id}`}
              uploading={image.status === "uploading"}
              uploadProgress={image.uploadProgress}
              completed={image.status === "completed"}
              onDelete={() => {
                if (image.status === "added") {
                  setImages((prev) =>
                    Object.fromEntries(
                      Object.entries(prev).filter(([, i]) => i.id !== image.id)
                    )
                  );
                }
              }}
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
              Object.entries(xhrInProgress.current).forEach(([id, xhr]) => {
                xhr.abort();
                updateImage(id, (image) => {
                  image.status = "added";
                  return image;
                });
              });
              xhrInProgress.current = {};
              clearTaskQueue();
            }}
          >
            Abort
          </Button>
        )}
        <Button
          disabled={isRunning}
          onClick={async () => {
            start(
              Object.values(images).map((image) => image.id),
              async (id: string) => {
                const xhr = new XMLHttpRequest();

                updateImage(id, (image: Image) => {
                  image.status = "uploading";
                  return image;
                });

                xhrInProgress.current[id] = xhr;

                await upload(xhr, images[id].file, (value) => {
                  updateImage(id, (image: Image) => {
                    image.uploadProgress = value;
                    return image;
                  });
                });

                delete xhrInProgress.current[id];

                updateImage(id, (image: Image) => {
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
