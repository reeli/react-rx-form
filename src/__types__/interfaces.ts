import { Dictionary } from "lodash";
import React from "react";
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

type TErrorMsg = string | undefined;
export type TFieldValue = any;
export type TValidator = (value: TFieldValue) => TErrorMsg;

export interface IFieldInnerProps extends IFieldState {
  name: string;
  onChange: (value: React.MouseEvent | TFieldValue) => void;
  onBlur: (value: React.MouseEvent | TFieldValue) => void;
  onFocus: () => void;
}

export interface IFieldMeta {
  dirty?: boolean;
  touched?: boolean;
  visited?: boolean;
  error?: TErrorMsg;
}

export interface IFieldState {
  value?: TFieldValue;
  meta: IFieldMeta;
}

export interface IFieldAction {
  name: string;
  type: FieldActionTypes;
  meta?: IFieldMeta & { destroyValueOnUnmount?: boolean };
  payload?: TFieldValue;
}

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

export interface IFieldArrayCoreState {
  fields: any[];
}

export interface IFields {
  [fieldName: string]: IFieldMeta;
}

export interface IFormValues {
  [fieldName: string]: TFieldValue;
}

export type TErrors = Dictionary<string | undefined>;
export type TOnSubmit<T extends IFormValues = any> = (values: T, onSubmitError: (errors: TErrors) => any) => any;

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
