import Application from 'ette';
import Router from 'ette-router';

import { IGeneralStores } from '../schema/stores';
import { debugIO } from '../../lib/debug';

export const createApp = function(
  stores: IGeneralStores,
  routers: Router[],
  innerApps: Record<string, Application> = {},
) {
  const app = new Application({ domain: 'lib-engine' });
  app.innerApps = innerApps; // 新增 innerApps 的挂载

  // 挂载 stores 到上下文中，注意这里的 next 必须要使用 async，否则 proxy 的时候将出现异步偏差
  app.use(async (ctx: any, next: any) => {
    ctx.stores = stores;
    ctx.innerApps = innerApps;
    // 因为存在代理，url 中的路径将有可能被更改
    const originUrl = ctx.request.url;
    debugIO(`[${stores.id}] request: ${JSON.stringify(ctx.request.toJSON())}`);
    await next();
    debugIO(
      `[${stores.id}] [${
        ctx.request.method
      }] ${originUrl} ==> response: ${JSON.stringify(ctx.response.toJSON())}`
    );
  });

  // 注册路由
  routers.forEach((router: Router) => {
    app.use(router.routes());
  });
  return app;
};
