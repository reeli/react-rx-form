import { Dictionary } from "lodash";
import * as React from "react";
import { Observer } from "rxjs/internal/types";

export type TRequired<T> = { [P in keyof T]: T[P] };
export type TChildrenRender<TProps> = (props: TProps) => React.ReactNode;

export enum FieldActionTypes {
  register = "@@rx-form/field/REGISTER_FIELD",
  change = "@@rx-form/field/CHANGE",
  destroy = "@@rx-form/field/DESTROY_FIELD",
}

type TError = string | undefined;
export type TValidator = (value: string | boolean) => TError | undefined;
export type TFieldValue = any;

export interface IFieldCommonProps {
  value?: TFieldValue;
  meta: {
    dirty: boolean;
    error?: TError;
  };
}

export interface IFieldInputProps {
  name: string;
  onChange: (value: TFieldValue) => void;
  value?: TFieldValue;
  error?: string;
}

export interface IFieldState extends IFieldCommonProps {}

export interface IFieldInnerProps extends IFieldState {
  name: string;
  onChange: (value: TFieldValue) => void;
}

export interface IFieldProps {
  name: string;
  children: TChildrenRender<IFieldInnerProps>;
  defaultValue?: TFieldValue;
  validate?: TValidator | TValidator[];
}

export interface IFieldAction {
  name: string;
  type: FieldActionTypes;
  payload?: IFieldState;
}

export interface IFieldCoreProps extends IFieldProps {
  formContextValue: IFormContextValue;
}

export interface IFieldCoreState {
  fieldState: IFieldState;
}

export interface IFormContextValue {
  dispatch: (fieldAction: IFieldAction) => any;
  subscribe: (observer: Observer<any>) => any;
  subscribeFormAction: (observer: Observer<any>) => any;
  updateFormValues: (formValues: IFormValues) => any;
  getFormValues: () => IFormValues;
}

export interface IFieldArrayInnerProps extends IFieldArrayCoreState {
  add: () => any;
  remove: (idx: number) => any;
}

export interface IFieldArrayProps {
  name: string;
  children: TChildrenRender<IFieldArrayInnerProps>;
  initLength?: number;
}

export interface IFieldArrayCoreState {
  fields: any[];
}

export interface IFieldArrayCoreProps extends IFieldArrayProps, IFormContextValue {}

export interface IFormValuesInnerProps {
  formValues: IFormValues;
  updateFormValues: IFormContextValue["updateFormValues"];
}

export interface IFormValuesCoreState {
  formValues: IFormValues;
}

export interface IFormValuesCommonProps {
  children: TChildrenRender<IFormValuesInnerProps>;
}

export interface IFormValuesCoreWrapperProps extends IFormValuesCommonProps {
  forwardedRef?: React.Ref<any>;
}

export interface IFormValuesCoreProps extends IFormValuesCommonProps {
  formContextValue: IFormContextValue;
  ref?: React.Ref<any>;
}

export interface IFormState {
  [fieldName: string]: IFieldState;
}

export interface IFormValues {
  [fieldName: string]: TFieldValue;
}

export type TErrors = Dictionary<string | undefined>;
export type TOnSubmit = (values: IFormValues, onSubmitError: (errors: TErrors) => any) => any;

interface IRxFormInnerProps {
  handleSubmit: (onSubmit: TOnSubmit) => (formEvent: React.FormEvent) => any;
}

export interface IRxFormProps {
  children: TChildrenRender<IRxFormInnerProps>;
  initialValues?: IFormValues | IFormValues[];
}

export interface IFormAction {
  type: string;
  payload: {
    formState: IFormState;
  };
}

export enum FormActionTypes {
  initialize = "@@rx-form/form/INITIALIZE",
  startSubmit = "@@rx-form/form/START_SUBMIT",
  startSubmitFailed = "@@rx-form/form/START_SUBMIT_FAILED",
  onChange = "@@rx-form/form/CHANGE",
}

export interface IForm {
  formState: IFormState;
  values: IFormValues;
}
