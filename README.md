# React Rx Form

## 数据流

![rx-form-flow](./docs/rx-form-flow.svg)

为了更好的理解数据流，让我们来看一个简单的例子。我们有一个 Form 组件，它的内部包含了一个 Field 组件，在 Field 组件内部又包含了一个 Text Input。数据流可能是像下面这样的:

1. 用户在输入框中输入一个字符
2. Input 的 `onChange` 事件会被 Trigger
3. Field 的 `onChange` Action 会被 Dispatch
4. 根据 Field 的 `onChange` Action 对 `Form State` 进行修改。
5. Form State 更新之后会通知给 Field 的观察者
6. Field 的观察者将当前 Field 的 State pick 出来，如果发现有更新则 `setState`。
7. `setState` 会使 Field `rerender`，新的 Field Value 就可以通知给 Input 了。

## React Rx Form VS Redux Form

在 Redux Form 中:

- 安装之后还需要一些 redux 相关的配置才能使用。
- Field 的 `component` 不能写成 inline 的形式 (匿名函数)，否则每一次 render 都重新创建新的组件，导致组件内部状态丢失，对性能也会有影响。
- Field 中必须实现 `shouldComponentUpdate` 逻辑 (Redux Form 内部已经实现了)，否则每一个 Field 的状态更新都会导致 Form 中其他的 Field rerender。
- 除了一些 state 和 value 之外，Input 需要的其他 props (如 placeholder，type 等) 必须从 Field props 传递下去。
- 所有的 Form State 都保存在全局的 Redux Store 中，如果你有服务端渲染或者数据持久化的需求，选择 Redux Form 会更适合。

在 React Rx Form 中:

- 使用更简单，安装即用。
- Field 通过 Child Render 的方式来连接子组件，不用再担心 inline comopnent 的问题。
- 通过 Rx，我们可以将 Feilds 更新的粒度控制到最小。当某个 Field 的状态发生变化时，不需要在 Feild 内部去实现 `shouldComponentUpdate`，也不会导致其他的 Field rerender。
- Feild 只会把它托管的 State 传递给 Input，而 Input 需要的其他 props 交由 Input 自行决定。
- 所有的 Form State 都保存在 Form 组件内部，没有全局的 State，如果你不期望将 Form 的 State 放到全局，React Rx Form 会是一个更好的选择。

## 使用手册

React Rx Form 的使用方法非常简单，不需要其他额外的配置，安装完成之后就能直接使用。

### 安装

`npm install @reeli/react-rx-form`

### 开始使用

```ts
import React, { Component } from "react";
import { Field, RxForm } from "@reeli/react-rx-form";

export class ContactForm extends Component {
  onSubmit = (formValues: any) => {
    console.log(formValues);
  };

  render() {
    return (
      <RxForm>
        {({ handleSubmit }) => (
          <form onSubmit={handleSubmit(this.onSubmit)}>
            <Field name="firstName">
              {({ value, onChange }) => (
                <input value={value} onChange={onChange} type="text" placeholder="First Name" />
              )}
            </Field>
            <button type="submit">Submit</button>
          </form>
        )}
      </RxForm>
    );
  }
}
```
