import { IFormState } from "@react-rx/form";
import * as React from "react";
import { Observable, Subject, Subscription } from "rxjs";
import { FormConsumer } from "../src/FormContext";

class FormStateObservableCore extends React.Component<any> {
  subscription: Subscription | null = null;
  subscription2: Subscription | null = null;

  componentDidMount(): void {
    const formStateObserver$ = new Subject<IFormState>();

    this.subscription2 = (this.props.children as any)(formStateObserver$).subscribe();
    this.subscription = this.props.subscribe(formStateObserver$);
  }

  componentWillUnmount(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
      this.subscription = null;
    }
    if (this.subscription2) {
      this.subscription2.unsubscribe();
      this.subscription2 = null;
    }
  }

  render() {
    return null;
  }
}

export const FormStateObservable = ({
  children,
}: {
  children: (formState$: Observable<IFormState>) => Observable<IFormState>;
}) => <FormConsumer>{(ctx) => <FormStateObservableCore {...ctx} children={children} />}</FormConsumer>;
