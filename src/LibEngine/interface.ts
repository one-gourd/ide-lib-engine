import Router from 'ette-router';
import {
  TAnyFunction,
  IProxyRule,
  IAliasRoute,
  IAliasRule,
  IStoresEnv,
  TAnyMSTModel
} from 'ide-lib-base-component';
import { IAnyType } from 'mobx-state-tree';

export type TFactoryFunction = (
  ...args: any[]
) => Partial<IStoresEnv<TAnyMSTModel>>;

export type TSubFactoryMap<ISubProps> = Record<
  keyof ISubProps,
  TFactoryFunction
>;

// TODO: 迁移到 lib-base-component 中
export type ValueOf<T> = T[keyof T];

// type TProps<T> = T extends (infer U) ? U : any;
export interface IComponentConfig<Props, ISubProps> {
  className: string;
  solution?: Record<string, TAnyFunction[]>;
  defaultProps?: Props;
  children?: Record<string, IComponentConfig<ValueOf<ISubProps>, any>>;
  storesModel?: TAnyMSTModel;
  factory?: TFactoryFunction;

  // 主要是用在 children 内的
  normal?: React.FunctionComponent<Props>;
  addStore?: (
    storesEnv: IStoresEnv<TAnyMSTModel>
  ) => React.FunctionComponent<Props>;
  namedAs?: string; // 属性名
  routeScope?: string[]; // 可以被父元素访问到的 route 名字
}
export interface IModuleConfig<Props, ISubProps> {
  component: IComponentConfig<Props, ISubProps>;
  router: {
    domain: string;
    list?: Router[];
    hoistRoutes?: IAliasRoute | IAliasRoute[]; // 提升访问子路由功能，相当于是强约束化的 alias
    aliases?: IAliasRule | IAliasRule[]; // 自定义的路由别名规则
  };

  store: {
    idPrefix: string;
  };
  model: {
    controlledKeys: string[];
    props: Record<string, IAnyType>;
  };
}
