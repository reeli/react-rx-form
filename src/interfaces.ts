import { Dictionary } from "lodash";
import * as React from "react";
import { Observer } from "rxjs/internal/types";

export type TRequired<T> = { [P in keyof T]: T[P] };
export type TChildrenRender<TProps> = (props: TProps) => React.ReactNode;

export enum FieldActionTypes {
  register = "@@rx-form/field/REGISTER_FIELD",
  change = "@@rx-form/field/CHANGE",
  focus = "@@rx-form/field/FOCUS",
  blur = "@@rx-form/field/BLUR",
  destroy = "@@rx-form/field/DESTROY_FIELD",
}

type TError = string | undefined;
export type TValidator = (value: string | boolean) => TError;
export type TFieldValue = any;

export interface IFieldMeta {
  dirty?: boolean;
  touched?: boolean;
  visited?: boolean;
  error?: TError;
}

export interface IFieldState {
  value?: TFieldValue;
  meta: IFieldMeta;
}

export interface IFieldInnerProps extends IFieldState {
  name: string;
  onChange: (value: TFieldValue) => void;
  onBlur: (value: TFieldValue) => void;
  onFocus: () => void;
}

export interface IFieldProps {
  name: string;
  children: TChildrenRender<IFieldInnerProps>;
  defaultValue?: TFieldValue;
  validate?: TValidator | TValidator[];
  format?: (value: TFieldValue) => TFieldValue;
  parse?: (value: TFieldValue) => TFieldValue;
}

export interface IFieldAction {
  name: string;
  type: FieldActionTypes;
  meta?: IFieldMeta;
  payload?: TFieldValue;
}

export interface IFieldCoreProps extends IFieldProps, IFormContextValue {}

export interface IFormContextValue {
  dispatch: (fieldAction: IFieldAction) => any;
  subscribe: (observer: Observer<any>) => any;
  subscribeFormAction: (observer: Observer<any>) => any;
  updateFormValues: (formValues: IFormValues) => any;
  getFormValues: () => IFormValues;
  getFormState: () => IFormState;
  fieldPrefix?: string;
  setErrors: (errors: TErrors) => any;
}

export interface IFieldArrayInnerProps extends IFieldArrayCoreState {
  add: () => any;
  remove: (idx: number) => any;
  each: (mapper: (fieldName: string, idx: number) => React.ReactNode) => React.ReactNode;
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

export interface IFormValuesCoreProps extends IFormValuesCommonProps {
  formContextValue: IFormContextValue;
}

export interface IFields {
  [fieldName: string]: IFieldMeta;
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
  initialValues?: IFormValues;
}

export interface IFormAction {
  type: string;
  payload: {
    fields: IFields;
    values: IFormValues;
  };
}

export enum FormActionTypes {
  startSubmit = "@@rx-form/form/START_SUBMIT",
}

export interface IFormState {
  fields: IFields;
  values: IFormValues;
}

export interface IFormSectionProps {
  name: string;
  formContextValue: IFormContextValue;
}
