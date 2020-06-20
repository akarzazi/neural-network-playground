import * as React from 'react';
import './Checkbox.css'


export interface Props<T> {
    label: string;
    checked?: boolean;
    onChange?: (newValue: boolean) => void;
}

export function Checkbox<T extends string>(props: Props<T>) {

    function onChange(e: React.ChangeEvent<HTMLInputElement>) {
        props.onChange?.(e.currentTarget.checked);
    }

    return (
        <div className="input-wrapper">
            <label className="Checkbox block-label">{props.label}
                <input type="checkbox" onChange={onChange} checked={props.checked} />
                <span className="checkmark"></span>
            </label>
        </div>);
}