import * as React from 'react';
import { MemoizedInputNumber } from '../InputNumber/InputNumber';
import './MinMaxInput.css'

export interface Props {
    label: string;
    // labelMin:string;
    // labelMax:string;
    min: number;
    max: number;
    onChange?: (min: number, max: number) => void;
}

export function MinMaxInputNumber(props: Props) {

    const [min, setMin] = React.useState(props.min);
    const [max, setMax] = React.useState(props.max);

    function onMinChange(newMin: number) {
        if (newMin >= max) {
            setMax(newMin + 1);
        }
        setMin(newMin);
    }

    function onMaxChange(newMax: number) {
        if (min >= newMax) {
            setMin(newMax - 1);
        }
        setMax(newMax);
    }

    React.useEffect(() => {
        props.onChange?.(min, max);
    }, [min, max]);

    React.useEffect(() => {
        setMin(props.min);
        setMax(props.max);
    }, [props.min, props.max]);

    return (
        <div className="MinMaxInput" >
            <label className="label-entry">{props.label}</label>
            <span> ∈ [</span>
            <MemoizedInputNumber value={min} onChange={onMinChange} />
            <span>,</span>
            <MemoizedInputNumber value={max} onChange={onMaxChange} />
            <span>]</span>
        </div>)

}