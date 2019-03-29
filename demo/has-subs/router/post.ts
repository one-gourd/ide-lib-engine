import Router from 'ette-router';
import { buildNormalResponse } from 'ide-lib-base-component';

import { IContext } from './helper';
import { createModel } from '../../../src';

import { HeaderBlockModel } from '../main';

export const router = new Router();

// 创新新的 model
router.post('createModel', '/model', function(ctx: IContext) {
  const { stores, request } = ctx;
  const { model } = request.data;

  stores.setModel(createModel(HeaderBlockModel, model));

  buildNormalResponse(ctx, 200, { success: true });
});
