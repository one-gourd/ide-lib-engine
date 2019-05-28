# Change Log

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [0.1.6](https://github.com/one-gourd/ide-lib-engine/compare/v0.1.5...v0.1.6) (2019-05-28)


### Bug Fixes

* 🐛 修复 subComponentInjected 在子组件中失效的问题 ([00cd96d](https://github.com/one-gourd/ide-lib-engine/commit/00cd96d))


### Features

* 🎸 功能新增: subComponentInjected ([024eab7](https://github.com/one-gourd/ide-lib-engine/commit/024eab7))



## [0.1.5](https://github.com/one-gourd/ide-lib-engine/compare/v0.1.4...v0.1.5) (2019-05-21)


### Bug Fixes

* 🐛 类型声明 ([b56f902](https://github.com/one-gourd/ide-lib-engine/commit/b56f902))


### Features

* 🎸 功能新增: advanceMerge ([32be3db](https://github.com/one-gourd/ide-lib-engine/commit/32be3db))
* 🎸 功能新增: 支持 JSONMoel 特殊类型 ([6191778](https://github.com/one-gourd/ide-lib-engine/commit/6191778))



## [0.1.4](https://github.com/alibaba-paimai-frontend/ide-lib-engine/compare/v0.1.3...v0.1.4) (2019-04-30)


### Features

* 🎸 透出 StoresModel ([1d9bba7](https://github.com/alibaba-paimai-frontend/ide-lib-engine/commit/1d9bba7))



## [0.1.3](https://github.com/alibaba-paimai-frontend/ide-lib-engine/compare/v0.1.2...v0.1.3) (2019-04-25)


### Bug Fixes

* 🐛 初始化配置 ([bef4654](https://github.com/alibaba-paimai-frontend/ide-lib-engine/commit/bef4654))
* 🐛 响应模型: stores ([b416369](https://github.com/alibaba-paimai-frontend/ide-lib-engine/commit/b416369))


### Features

* 🎸 功能完善: 新增方法 ([513fe7e](https://github.com/alibaba-paimai-frontend/ide-lib-engine/commit/513fe7e))



<a name="0.1.2"></a>
## [0.1.2](https://github.com/alibaba-paimai-frontend/ide-lib-engine/compare/v0.1.1...v0.1.2) (2019-04-12)


### Features

* **功能新增: 方法:** 新增 quickInitModel 方法, 用于快速创建 mst 对象 ([55c27cd](https://github.com/alibaba-paimai-frontend/ide-lib-engine/commit/55c27cd))
* **功能新增: 配置项:** 新增 extends 配置项, 能够扩展 MST 对象的能力; ([d555410](https://github.com/alibaba-paimai-frontend/ide-lib-engine/commit/d555410))



<a name="0.1.1"></a>
## 0.1.1 (2019-04-02)


### Bug Fixes

* **类型声明:** 去掉 interface.ts 文件，将声明并入到 component.ts 文件中 ([a5a9576](https://github.com/alibaba-paimai-frontend/ide-lib-engine/commit/a5a9576))


### Features

* **功能增强:** 剥离组件业务和 engine 逻辑 ([c3d823f](https://github.com/alibaba-paimai-frontend/ide-lib-engine/commit/c3d823f))
* **功能增强: router proxy:** 新增路由代理功能；变更 ISubProps 的类型声明； ([d6d9d3a](https://github.com/alibaba-paimai-frontend/ide-lib-engine/commit/d6d9d3a))
* **功能增强: 子组件:** 支持子组件的情况；新增 has-sub demo 可运行； ([6181911](https://github.com/alibaba-paimai-frontend/ide-lib-engine/commit/6181911))
* **功能完善: 代码分离:** 将业务代码从 engine 中分离出去 ([3d21110](https://github.com/alibaba-paimai-frontend/ide-lib-engine/commit/3d21110))
* **功能完善: 完备性:** 同步 view 和 model 的 defaultValue 属性；更新 storybook 内容和示例；simple 组件 demo可用 ([abb76af](https://github.com/alibaba-paimai-frontend/ide-lib-engine/commit/abb76af))
* **功能新增: 路由代理:** 接入 lib-base-component 提供的 aliasPathProxy、hoistSubRoutes 两个方法 ([6e1af37](https://github.com/alibaba-paimai-frontend/ide-lib-engine/commit/6e1af37))


### Performance Improvements

* **缓存: createStores:** 给 createStores 新增缓存功能，防止对同一个组件创建多个 Model ([6307225](https://github.com/alibaba-paimai-frontend/ide-lib-engine/commit/6307225))
