import { Instance } from 'mobx-state-tree';

import { createModelFromConfig } from './schema/index';
import { configLibEngine, CONTROLLED_KEYS } from './config';

// 创建 LibEngine 模型
export const LibEngineModel = createModelFromConfig(
  configLibEngine.basic.className,
  configLibEngine.model.props,
  CONTROLLED_KEYS
);

export interface ILibEngineModel extends Instance<typeof LibEngineModel> {}
