declare namespace Api {
  interface ErrorResponse {
    message: string;
  }

  interface LambdaResponse<T> {
    component: { theming: Record<string, string> };
    response: T;
  }
}
