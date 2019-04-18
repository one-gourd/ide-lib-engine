import { message } from 'antd';
// import { getValueByPath } from 'ide-lib-utils';
import { IStoresEnv } from 'ide-lib-base-component';
import { IStoresModel } from '../../../../src';
// import { RPATH } from '../../router/helper'

/**
 * 显示 list 列表项
 * @param env - IStoresEnv
 */
export const showConsole = (
  env: IStoresEnv<IStoresModel>,
  actionContext: { context: { [key: string]: any }}
) => async (key: string, keyPath: Array<string>, item: any) => {
  const { stores, client } = env;
  console.log(777, key);

  // 测试 context 的使用
  const { context } = actionContext;
  context.hello = 'world';
  // stores.model.setVisible(true); // 可见
};

export const afterShowConsole = (
  env: IStoresEnv<IStoresModel>,
  actionContext: { context: { [key: string]: any }}
) => async (key: string, keyPath: Array<string>, item: any) => {
  const { context } = actionContext;
  console.log(
    '[afterShowConsole] action context:',
    context
  );

  context.hello = 'world(after)';

  // stores.model.setVisible(true); // 可见
};
