import * as React from 'react';
import './Slider.css'
import { buildClassName } from '../../helpers/UiHelper';

export function Slider(props: SliderProps) {

    const [value, setValue] = React.useState(props.value);

    function onSliderChange(e: React.ChangeEvent<HTMLInputElement>) {
        setValue(e.target.valueAsNumber);
        props.onChange(e.target.valueAsNumber);
    }

    function getLabelText() {
        if (props.labelRenderer) {
            return props.labelRenderer(value);
        }
        return <>{props.label}&nbsp;&nbsp;<span className="value">{value}</span></>
    }

    return (
        <div className={buildClassName(["Slider", props.className])} >

            <label className="slider-label">{getLabelText()}</label>
            <input type="range" name="rangeInput"
                value={props.value}
                step={props.step}
                min={props.min}
                max={props.max}
                onChange={onSliderChange} />

        </ div>
    );
}

export interface SliderProps {
    className?: string
    onChange: (newValue: number) => void
    label?: string;
    labelRenderer?: (newValue: number) => JSX.Element;
    min: number;
    max: number;
    step?: number;
    value: number;
}
