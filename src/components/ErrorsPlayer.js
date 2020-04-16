import React, { useState, Fragment, useRef } from "react";
import PropTypes from "prop-types";
import Player from "rrweb-player";

const ErrorsPlayer = () => {
  const errors = JSON.parse(sessionStorage.getItem(`errors`)) || [];
  const [activeError, setActiveError] = useState(null);
  const playerRef = useRef(null);

  const handleChangeError = (error) => {
    setActiveError(error);
    playerRef.current.innerHTML = ``;
    new Player({
      target: playerRef.current, // customizable root element
      data: {
        events: error.lastEvents,
        autoPlay: true,
      },
    });
  };
  return (
    <section>
      <div
        style={{
          height: `60px`,
          display: `flex`,
          borderBottom: `1px solid gray`,
        }}
      >
        {errors.map((error, index) => {
          return (
            <div style={{ marginRight: `5px` }} key={index}>
              <button type={`button`} onClick={() => handleChangeError(error)}>
                Показать #{index + 1}
              </button>
            </div>
          );
        })}
      </div>
      <div style={{ borderBottom: `1px solid gray` }}>
        {activeError && (
          <Fragment>
            {activeError.message && <p>Текст ошибки: {activeError.message}</p>}
            <p>Тип: {activeError.type}</p>
            {activeError.stack && (
              <p title={activeError.stack}>
                Стек: {activeError.stack.slice(0, 400)}
                {activeError.stack.length > 400 && ` ...`}
              </p>
            )}
            {activeError.fileName && <p>fileName: {activeError.fileName}</p>}
            {activeError.lineno && <p>fileName: {activeError.lineno}</p>}
            {activeError.colno && <p>fileName: {activeError.colno}</p>}
            <p>
              Последние запросы:
              {activeError.requests.map(({ url, duration }, index) => (
                <Fragment key={`req-${index}`}>
                  <br />
                  <span
                    style={{ marginRight: `50px` }}
                  >{`url: ${url}`}</span>{" "}
                  {`время(мс): ${duration.toFixed(0)}`}
                </Fragment>
              ))}
            </p>
          </Fragment>
        )}
      </div>
      <div ref={playerRef} />
    </section>
  );
};

ErrorsPlayer.propTypes = {};

export default ErrorsPlayer;
