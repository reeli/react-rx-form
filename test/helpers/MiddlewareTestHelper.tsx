export class MiddlewareTestHelper {
  static of(middleware: any) {
    return new MiddlewareTestHelper(middleware);
  }

  constructor(private middleware: any) {}

  create() {
    const store = {
      dispatch: jest.fn(),
      getState: jest.fn(),
    };
    const next = jest.fn();
    const invoke$ = (action: any) => this.middleware(store)(next)(action);

    return {
      store,
      next,
      invoke$,
    };
  }
}
