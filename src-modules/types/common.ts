import * as React from "react";

export type TRequired<T> = { [P in keyof T]: T[P] };
export type TChildrenRender<TProps> = (props: TProps) => React.ReactNode;
