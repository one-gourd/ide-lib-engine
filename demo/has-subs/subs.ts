import {
  HeaderBar,
  Stores as HeaderBarStores,
  HeaderBarAddStore,
  IHeaderBarProps,
  DEFAULT_PROPS as DEFAULT_PROPS_HEADER_BAR,
  HeaderBarFactory
} from 'ide-header-bar';

import { IComponentConfig } from '../../src';

// model + control: 枚举子属性
// export enum ESubApps {
//   headerBar = 'headerBar'
// }

// component: 子组件属性名
export interface ISubProps {
  headerBar?: IHeaderBarProps;
}

export type TSubProps = IHeaderBarProps;

// component: 子组件属性列表
export const subComponents: Record<string, IComponentConfig<TSubProps, any>> = {
  headerBar: {
    className: 'HeaderBar',
    namedAs: 'headerBar',
    defaultProps: DEFAULT_PROPS_HEADER_BAR,
    normal: HeaderBar,
    addStore: HeaderBarAddStore,
    storesModel: HeaderBarStores,
    factory: HeaderBarFactory,
  }
};
