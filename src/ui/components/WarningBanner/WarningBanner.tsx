import React = require("react");

export function WarningBanner(props: { warn: string }) {
    if (!props.warn) {
        return null;
    }

    return (
        <div className="warning">
            {props.warn}
        </div>
    );
}