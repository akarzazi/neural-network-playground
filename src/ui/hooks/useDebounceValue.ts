import React = require("react");

export function useDebounceValue<T>(value: T, timeout: number) {

    const [debouncedValue, setDebouncedValue] = React.useState(value);

    React.useEffect(() => {

        var id = window.setTimeout(() => {
            setDebouncedValue(value);
        }, timeout);

        return () => window.clearTimeout(id);

    }, [value, timeout]);

    return debouncedValue;
}