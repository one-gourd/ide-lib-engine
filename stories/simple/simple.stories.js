import React from 'react';
import { storiesOf } from '@storybook/react';
import { wInfo } from '../../.storybook/utils';

import {
  LibEngine,
  LibEngineModel,
  LibEngineAddStore
} from '../../demo/simple/main';
import { createModel, createStores } from '../../src';
import mdMobx from './simple-mobx.md';
import mdPlain from './simple-plain.md';

const propsNormal = {
  visible: true,
  text: ''
};
const propsModel = createModel(LibEngineModel, propsNormal);
// const stores = createStores(LibEngineModel, 'custom_le');

function onClick(value) {
  console.log('当前值：', value);
}

const clickBtn = target => () => {
  if (target && target.setVisible) {
    target.setText('hello world');
  } else {
    target.text = 'hello world';
  }
};

storiesOf('基础使用', module)
  .addParameters(wInfo(mdMobx))
  .addWithJSX('使用 mobx 化的 props', () => {
    // const LibEngineWithStore = LibEngineAddStore({ stores });
    return (
      <div>
        <button onClick={clickBtn(propsModel)}>更改文案（会响应）</button>
        {/* <LibEngineWithStore onClick={onClick} /> */}
      </div>
    );
  })
  .addParameters(wInfo(mdPlain))
  .addWithJSX('普通 props 对象', () => (
    <div>
      <button onClick={clickBtn(propsNormal)}>更改文案（不会响应）</button>
      <LibEngine {...propsNormal} onClick={onClick} />
    </div>
  ));
