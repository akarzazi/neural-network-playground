import * as React from 'react';
import './PivotRadio.css'

export interface Props<T> {
    className?: string;
    options: RadioOption<T>[];
    name: string;
    selectedValue?: string;
    OnSelectionChanged?: (newValue: T) => void;
}

export interface RadioOption<T> {
    value: T;
    label?: string
}

export function PivotRadio<T extends string>(props: Props<T>) {

    const [selectedValue, setSelectedValue] = React.useState(props.selectedValue)
    function onChange(e: React.ChangeEvent<HTMLInputElement>) {
        setSelectedValue(e.currentTarget.value);
        props.OnSelectionChanged?.(e.currentTarget.value as T)
        console.log(e.currentTarget.value);
    }
    
    return (
        <div className={"PivotRadio" + " " + props.className}>
            {props.options.map(option => {
                return (
                    <label key={option.value} className="pivot-radio-item">
                        <input type="radio" name={props.name} value={option.value} onChange={onChange} checked={option.value == selectedValue} />
                        <span className="radio-text">{option.label ?? option.value}</span>
                        <span className="radiobtn"></span>
                    </label>
                );
            })}
        </div>);
}