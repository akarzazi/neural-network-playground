import React = require("react");

export function useDebounce(func: () => void, timeout: number) {

    const id = React.useRef(0);

    var newFunc = () => {
        clearTimeout(id.current);

        var innerId = window.setTimeout(() => {
            func();
        }, timeout);

        id.current = innerId;

    };

    return newFunc;
}