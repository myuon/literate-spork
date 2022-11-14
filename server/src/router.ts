import Router, { IRouterOptions } from "koa-router";
import fs from "fs";
import path from "path";

export const newRouter = (options?: IRouterOptions) => {
  const router = new Router(options);

  router.get("/hello", async (ctx) => {
    ctx.body = "Hello World!";
  });
  router.post("/upload/:filename", async (ctx) => {
    const { filename } = ctx.params;

    await new Promise((resolve) => {
      ctx.req.pipe(
        fs.createWriteStream(
          path.resolve(__dirname, "..", `./uploads/${filename}`)
        )
      );
      ctx.req.on("end", () => {
        resolve(true);
      });
    });

    ctx.body = "OK";
  });

  return router;
};
