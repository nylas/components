export type Explanation = {
  title: string;
  subtitle: string;
};

export type NErrorType = [
  "DatabaseError",
  "HostDomainNotAllowedError",
  "RequestNotAllowed",
  "UserInputError",
  "MiddlewareError",
];

type INErrorExplanationMap = {
  [Key in NErrorType[number]]: () => Explanation;
};

export const NErrorExplanationMap: INErrorExplanationMap = new Proxy<INErrorExplanationMap>(
  {
    DatabaseError: () => ({
      title: "",
      subtitle: "",
    }),
    HostDomainNotAllowedError: () => ({
      title: `
        You are trying to access this component from <code>${window.location.hostname}</code>. 
        The component's settings do not allow access from this domain.
      `,
      subtitle: `The list of allowed domains can be modified in your <a href="https://dashboard.nylas.com">Dashboard</a>.`,
    }),
    RequestNotAllowed: () => ({
      title: "",
      subtitle: "",
    }),
    UserInputError: () => ({
      title: "",
      subtitle: "",
    }),
    MiddlewareError: () => ({
      title: "",
      subtitle: "",
    }),
  } as INErrorExplanationMap,
  {
    get: (target, prop) => target[prop] || target.MiddlewareError, // fall back to middleware error
  },
);
