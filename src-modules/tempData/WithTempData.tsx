import { AxiosResponse } from "axios";
import { isEmpty, isEqual } from "lodash";
import * as React from "react";
import { connect, DispatchProp } from "react-redux";
import { Subscription } from "rxjs/internal/Subscription";
import { createRequestSuccessAction, IRequestAction, IRequestSuccessAction } from "../request";
import { TChildrenRender } from "../types/common";
import { removeTempData, updateTempData } from "./actions";

interface IWithTempDataInnerProps {
  data: any;
}

interface IWithTempDataStateProps {
  state: any;
}

interface IWithTempDataOwnProps {
  groupKey: string;
  args?: object;
  actionCreator: (args: object) => IRequestAction;
  reducer: (state: any, action: IRequestSuccessAction) => any;
  children: TChildrenRender<IWithTempDataInnerProps>;
}

interface IWithTempDataProps extends DispatchProp, IWithTempDataOwnProps, IWithTempDataStateProps {}

class WithTempDataCore extends React.Component<IWithTempDataProps> {
  subscription: Subscription | null = null;

  fetchData = (args?: object) => {
    const requestAction = this.props.actionCreator(args || {});
    const observable$ = this.props.dispatch(requestAction) as any;
    this.subscription = observable$.subscribe((response: AxiosResponse) => {
      const requestSuccessAction = createRequestSuccessAction(requestAction, response);
      this.props.dispatch(
        updateTempData(this.props.groupKey, this.props.reducer(this.props.state, requestSuccessAction)),
      );
    });
  };

  componentDidMount() {
    this.fetchData(this.props.args);
    // setTimeout(() => {
    //   this.unsubscribe();
    //   this.props.dispatch(removeTempData(this.props.groupKey));
    // }, 2000);
  }

  componentDidUpdate(prevProps: IWithTempDataProps) {
    if (!isEmpty(prevProps.args) && !isEqual(prevProps.args, this.props.args)) {
      this.unsubscribe();
      this.fetchData(this.props.args);
    }
  }

  unsubscribe = () => {
    if (this.subscription) {
      this.subscription.unsubscribe();
      this.subscription = null;
    }
  };

  componentWillUnmount() {
    this.unsubscribe();
    this.props.dispatch(removeTempData(this.props.groupKey));
  }

  render() {
    return this.props.children({
      data: this.props.state,
    });
  }
}

const mapStateToProps = (state: any, ownProps: any) => {
  return {
    state: state.tempData[ownProps.groupKey] || {},
  };
};

export const WithTempData = connect<IWithTempDataStateProps, DispatchProp, IWithTempDataOwnProps, any>(mapStateToProps)(
  WithTempDataCore,
);
