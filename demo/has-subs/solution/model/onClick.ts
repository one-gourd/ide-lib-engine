import { message } from 'antd';
// import { getValueByPath } from 'ide-lib-utils';
import { IStoresEnv } from 'ide-lib-base-component';
import { IStoresModel } from '../../../../src';
// import { RPATH } from '../../router/helper'

let globalIndex = 0;
/**
 * 显示 list 列表项
 * @param env - IStoresEnv
 */
export const showConsole = (env: IStoresEnv<IStoresModel>) => async (
  key: string,
  keyPath: Array<string>,
  item: any
) => {
  const { stores, client } = env;
  console.log('[solution] from self:', key);

  // 存储状态值
  client.put('/model/cstate', {
    name: 'globalIndex', 
    value: globalIndex++
  });

  // 存储状态值
  client.put('/model/cstate', {
    name: 'obj', 
    value: {
      a: 1, 
      b: {
        e: 5
      },
      d: 2
    }
  });
  // stores.model.setVisible(true); // 可见
};
