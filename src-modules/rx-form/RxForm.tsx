import { Dictionary, mapValues, reduce } from "lodash";
import * as React from "react";
import { Subject } from "rxjs/internal/Subject";
import { Subscription } from "rxjs/internal/Subscription";
import { Observer } from "rxjs/internal/types";
import { TChildrenRender } from "../types/common";
import { FormContext } from "./FormContext";
// interface IWithRxFormInnerProps {
//   onSubmit: () => void;
// }

interface IField {
  name: string;
  value: string;
  error?: string;
}

export interface IFields {
  [name: string]: IField;
}

export interface IFormValues {
  [name: string]: string;
}

interface IIRxFormInnerProps {
  onSubmit: (evt: any) => void;
}

interface IRxFormProps {
  onSubmit: (values: IFormValues, onSubmitError: any) => void;
  children: TChildrenRender<IIRxFormInnerProps>;
}

// 1. 把 field 的基本信息创建一个大配置
// 2. 创建一个 WithRxForm 用来管理 form 状态
// 3. 向下提供 value 和 onValueChange 方法，当表单元素 onChange 时，调用 onValueChange 更新 form 状态
// 4. 创建一个 formSubject，当 field 值更新时，把值发给 formSubject，通过 formSubject.subscribe 就能够拿到所有 fields 的信息

export enum FieldActionTypes {
  register = "register",
  change = "change",
  unregister = "unregister",
}

interface IFieldAction {
  type: FieldActionTypes;
  name: string;
  value?: string;
  error?: string;
}

export class RxForm extends React.Component<IRxFormProps> {
  private formState$ = new Subject();
  private formSubject$ = new Subject();
  private formActionsSubscription: Subscription | null = null;
  private fields = {} as IFields;
  private subscription: Subscription | null = null;

  componentDidMount() {
    this.subscription = this.formState$.subscribe((fields) => {
      console.log(fields, "------");
    });
  }

  componentWillUnmount() {
    if (this.subscription) {
      this.subscription.unsubscribe();
      this.subscription = null;
    }
    if (this.formActionsSubscription) {
      this.formActionsSubscription.unsubscribe();
      this.formActionsSubscription = null;
    }
  }

  initFields = (action: IFieldAction) => {
    this.fields = {
      ...this.fields,
      [action.name]: {
        name: action.name,
      } as IField,
    };
    this.formState$.next(this.fields);
  };

  onSubmitError = (error: Dictionary<string>) => {
    this.fields = mapValues(this.fields, (field) => {
      return {
        ...field,
        error: error[field.name],
      };
    });
    this.formState$.next(this.fields);
  };

  updateFields = (action: IFieldAction) => {
    const field = {
      name: action.name,
    } as IField;
    if (action.value) {
      field.value = action.value;
    }
    if (action.error) {
      field.error = action.error;
    }
    this.fields = {
      ...this.fields,
      [action.name]: field,
    };
    this.formState$.next(this.fields);
  };

  dispatch = (fieldAction: IFieldAction) => {
    switch (fieldAction.type) {
      case FieldActionTypes.register: {
        return this.initFields(fieldAction);
      }
      case FieldActionTypes.change: {
        return this.updateFields(fieldAction);
      }
    }
  };

  subscribe = (observer: Observer<any>) => {
    return this.formState$.subscribe(observer);
  };

  subscribeFormSubmit = (observer: Observer<any>) => {
    return this.formSubject$.subscribe(observer);
  };

  onSubmit = (evt: any) => {
    evt.preventDefault();
    this.formSubject$.next({
      type: "FORM_SUBMIT_START",
      payload: {
        fields: this.fields,
      },
    });

    const hasError = reduce(
      this.fields,
      (result: boolean, item: IField) => {
        return result || !!item.error;
      },
      false,
    );

    if (hasError) {
      return;
    }

    const values = mapValues(this.fields, (field) => {
      return field.value;
    });
    this.props.onSubmit(values, this.onSubmitError);
  };

  render() {
    return (
      <FormContext.Provider
        value={{
          subscribe: this.subscribe,
          dispatch: this.dispatch,
          subscribeFormSubmit: this.subscribeFormSubmit,
        }}
      >
        {this.props.children({
          onSubmit: this.onSubmit,
        })}
      </FormContext.Provider>
    );
  }
}
