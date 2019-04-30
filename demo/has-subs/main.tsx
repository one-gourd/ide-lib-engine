import { Instance } from 'mobx-state-tree';
import { initSuitsFromConfig } from '../../src';

export * from './config';
export * from '.';

import { HeaderBlockCurrying } from '.';
import { configHeaderBlock } from './config';

const {
  ComponentModel: HeaderBlockModel,
  NormalComponent: HeaderBlock,
  ComponentHOC: HeaderBlockHOC,
  ComponentAddStore: HeaderBlockAddStore,
  ComponentFactory: HeaderBlockFactory,
  StoresModel: HeaderBlockStoresModel
} = initSuitsFromConfig(HeaderBlockCurrying, configHeaderBlock);

export {
  HeaderBlockModel,
  HeaderBlock,
  HeaderBlockHOC,
  HeaderBlockAddStore,
  HeaderBlockFactory,
  HeaderBlockStoresModel
};

export interface IHeaderBlockModel extends Instance<typeof HeaderBlockModel> {}
