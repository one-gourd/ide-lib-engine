import { IContext as IEtteContext } from 'ette';

import { IStoresModel } from '../../../src';
export interface IContext extends IEtteContext {
  stores: IStoresModel;
  [propName: string]: any;
}
