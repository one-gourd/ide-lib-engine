import { message } from 'antd';
// import { getValueByPath } from 'ide-lib-utils';
import { IStoresEnv } from 'ide-lib-base-component';
import { IStoresModel } from '../../../../src';
// import { RPATH } from '../../router/helper'

/**
 * 显示 list 列表项
 * @param env - IStoresEnv
 */
export const showButtonConsole = (env: IStoresEnv<IStoresModel>) => async (
  key: string,
  keyPath: Array<string>,
  item: any
) => {
  const { stores, client } = env;
  console.log('[solution] from headBar:', key);
  // stores.model.setVisible(true); // 可见

  // 获取状态值
  client.get('/model/cstate?filter=globalIndex').then(res=>{
    console.log('globalIndex:', res.body.data);
  });

  // 存储状态值
  client.put('/model/cstate', {
    name: 'obj',
    value: {
      a: 3,
      b: {
        c: 4
      }
    },
    mergeLevel: 2
  }).then(()=>{
    client.get('/model/cstate?filter=globalIndex,obj').then(res => {
      console.log('complex obj:', res.body.data);
    });
  });
};
