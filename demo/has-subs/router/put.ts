import Router from 'ette-router';
import {
  updateStylesMiddleware,
  updateThemeMiddleware,
  buildNormalResponse
} from 'ide-lib-base-component';

import { IContext } from './helper';

export const router = new Router();
// 更新单项属性
router.put('updateModel', '/model', function(ctx: IContext) {
  const { stores, request } = ctx;
  const { name, value } = request.data;

  //   stores.setSchema(createSchemaModel(schema));
  const originValue = stores.model[name];
  const isSuccess = stores.model.updateAttribute(name, value);

  buildNormalResponse(
    ctx,
    200,
    { success: isSuccess, origin: originValue },
    `属性 ${name} 的值从 ${originValue} -> ${value} 的变更的操作: ${isSuccess}`
  );
});

// TODO: 拓展，如果是 `propsEditor` 因为是 JSON model，还可以继续延续下去
router.put('updatePropsEditor', '/model/propsEditor', function(ctx: IContext) {
  const { stores, request } = ctx;
  const { name, value } = request.data;
  const originValue = stores.model.propsEditor[name];

  const isSuccess = stores.model.propsEditor.updateAttribute(name, value);

  buildNormalResponse(
    ctx,
    200,
    { success: isSuccess, origin: originValue },
    `属性 ${name} 的值从 ${originValue} -> ${value} 的变更: ${isSuccess}`
  );
});

// 更新 css 属性
router.put(
  'updateStyles',
  '/model/styles/:target',
  updateStylesMiddleware('model')
);

// 更新 theme 属性
router.put(
  'updateTheme',
  '/model/theme/:target',
  updateThemeMiddleware('model')
);
