import "./App.css";
import { css } from "@emotion/react";
import { useCallback, useEffect, useState } from "react";
import { SelectFiles } from "./components/SelectFiles";
import { Thumbnail } from "./components/Thumbnail";
import { Button } from "./components/Button";

const sleep = async (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

const upload = async (file: File) => {
  return sleep(Math.random() * 8000);
};

const SEMAPHORE_SIZE = 3;

function App() {
  const [images, setImages] = useState<{ file: File; status: string }[]>([]);

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
    await upload(images[task].file);
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
