import React, { useEffect } from "react";
import { record } from "rrweb";
import { snapshot } from "rrweb-snapshot";

// We use a two-dimensional array to store multiple events array
let eventsMatrix = [[]];
let snapshots = [snapshot(document)];

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
  // сохраняем серию из 2 последних периодов сбора событий
  const lastEvents = eventsMatrix
    .slice(-2)
    .reduce((result, events) => [...result, ...events], []); // склеиваем события за последние 2 периода. например если период 10 сек, то это будут события за последние 10-20 сек
  const lastSnapshot = snapshots.slice(-2)[0][0]; // берем снепшот первой серии
  console.log(lastSnapshot);
  try {
    console.log(`error event😈`, event);
    let context = {
      type: event.type,
      requests: getRequests(),
      lastEvents,
      lastSnapshot,
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
    errors.unshift(context);
    sessionStorage.setItem(`errors`, JSON.stringify(errors.splice(0, 10)));
  } catch (e) {
    console.log(e);
  }
  return false;
};

const ErrorsCollector = () => {
  useEffect(() => {
    record({
      emit(event, isCheckout) {
        // isCheckout is a flag to tell you the events has been checkout
        if (isCheckout) {
          eventsMatrix.push([]);
          snapshots.push(snapshot(document));
          eventsMatrix = eventsMatrix.slice(-3); // clear events buffer
          snapshots = snapshots.slice(-3); // clear snapshots buffer
        }
        const lastEvents = eventsMatrix[eventsMatrix.length - 1];
        lastEvents.push(event);
      },
      checkoutEveryNms: 5 * 1000, // длительность миммнимального периода сбора событий
    });

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
