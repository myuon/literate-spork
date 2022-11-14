import "./App.css";
import { css } from "@emotion/react";
import { useCallback, useEffect, useState } from "react";
import { SelectFiles } from "./components/SelectFiles";
import { Thumbnail } from "./components/Thumbnail";
import { Button } from "./components/Button";

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

const SEMAPHORE_SIZE = 3;

function App() {
  const [images, setImages] = useState<
    { file: File; status: string; uploadProgress: number }[]
  >([]);

  const [uploadTaskQueue, setUploadTaskQueue] = useState<number[]>([]);
  const isUploading = uploadTaskQueue.length > 0;
  const [semaphore, setSemaphore] = useState(0);

  const startUpload = async (tasks: number[]) => {
    setUploadTaskQueue(tasks);
  };
  const runQueue = useCallback(async () => {
    if (uploadTaskQueue.length === 0) {
      return;
    }
    if (semaphore >= SEMAPHORE_SIZE) {
      return;
    }

    const [task, ...rest] = uploadTaskQueue;
    setUploadTaskQueue(rest);
    setSemaphore((p) => p + 1);
    setImages((images) => {
      const newImages = [...images];
      newImages[task].status = "uploading";
      return newImages;
    });

    await upload(images[task].file, (value) => {
      setImages((images) => {
        const newImages = [...images];
        newImages[task].uploadProgress = value;
        return newImages;
      });
    });

    setImages((images) => {
      const newImages = [...images];
      newImages[task].status = "completed";
      return newImages;
    });
    setSemaphore((p) => p - 1);
  }, [images, semaphore, uploadTaskQueue]);

  useEffect(() => {
    if (isUploading) {
      runQueue();
    }
  }, [isUploading, runQueue]);

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
          disabled={isUploading}
          onClick={async () => {
            startUpload(images.map((_, index) => index));
          }}
        >
          Upload
        </Button>
      </div>
    </div>
  );
}

export default App;
