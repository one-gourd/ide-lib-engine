# Change Log

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

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
