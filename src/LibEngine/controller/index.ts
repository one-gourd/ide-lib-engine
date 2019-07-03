import Application from 'ette';
import Router from 'ette-router';
import {
  applyProxy,
  aliasPathProxy,
  hoistSubRoutes,
  IProxyRule,
  IAliasRoute,
  IAliasRule
} from 'ide-lib-base-component';

import { IStoresModel } from '../schema/stores';
import { debugIO } from '../../lib/debug';

export const createApp = function(
  stores: IStoresModel,
  routers: Router[],
  innerApps: Record<string, Application> = {},
  proxyRules: IProxyRule[],
  aliasRoutes: IAliasRoute[],
  aliases: IAliasRule[],
  domain: string
) {
  const app = new Application({ domain: domain });
  app.innerApps = innerApps; // 新增 innerApps 的挂载
  
  // 新增共享状态属性
  const cstate = {};

  // 挂载 stores 到上下文中，注意这里的 next 必须要使用 async，否则 proxy 的时候将出现异步偏差
  app.use(async (ctx: any, next: any) => {
    ctx.stores = stores;
    ctx.innerApps = innerApps;

    // 共享状态属性用于非组件状态的信息共享
    // 这个属性是为了解决必要关键信息共享的问题，请勿滥用
    ctx._cstate = cstate;

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

  // 进行路由代理
  if (proxyRules && proxyRules.length) {
    applyProxy(app, proxyRules);
  }

  // 子路由代理：子路由提升
  if (aliasRoutes && aliasRoutes.length) {
    hoistSubRoutes(app, aliasRoutes);
  }

  // 自定义重定向路由规则
  if (aliasRoutes && aliasRoutes.length) {
    aliasPathProxy(app, aliases);
  }

  // 注册路由
  routers.forEach((router: Router) => {
    app.use(router.routes());
  });
  return app;
};
