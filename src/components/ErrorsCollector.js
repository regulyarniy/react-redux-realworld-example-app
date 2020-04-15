import React, { useEffect } from "react";

const getRequests = () => {
  try {
    const resourceRequests = window.performance.getEntriesByType(`resource`);
    return resourceRequests
      .filter(
        (entry) =>
          entry.initiatorType === `fetch` ||
          entry.initiatorType === `xmlhttprequest`
      )
      .map(({ name, duration }) => ({ url: name, duration }))
      .splice(-5);
  } catch (e) {
    console.log(e);
  }
};

const handleError = (event) => {
  try {
    console.log(`error event😈`, event);
    let context = {
      type: event.type,
      requests: getRequests(),
    };
    const errors = JSON.parse(sessionStorage.getItem(`errors`)) || [];
    if (event instanceof PromiseRejectionEvent) {
      context = {
        ...context,
        message: event.reason.message,
        stack: event.reason.stack,
      };
    } else if (event instanceof ErrorEvent) {
      context = {
        ...context,
        message: event.error.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event.error.stack,
      };
    } else {
      context = {
        ...context,
        message: event.message,
      };
    }
    errors.push(context);
    sessionStorage.setItem(`errors`, JSON.stringify(errors.splice(-10)));
  } catch (e) {
    console.log(e);
  }
  return false;
};

const ErrorsCollector = () => {
  useEffect(() => {
    window.addEventListener(`error`, handleError, true);
    window.addEventListener(`unhandledrejection`, handleError, true);
    return () => {
      window.removeEventListener(`error`, handleError, true);
      window.removeEventListener(`unhandledrejection`, handleError, true);
    };
  }, []);
  return null;
};

export default ErrorsCollector;
