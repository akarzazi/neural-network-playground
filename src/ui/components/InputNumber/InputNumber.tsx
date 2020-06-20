import * as React from 'react';

export interface Props {
    value: number;
    onChange?: ((newValue: number) => void);
}

export interface State {
    strValue: string;
    numValue: number;
}

function InputNumber(props: Props) {

   // const [obj, setobj] = useGlobal("from-number");
    const [strValue, setStrValue] = React.useState(props.value.toString());
    const [numValue, setNumValue] = React.useState(props.value);

    function onChange(e: React.ChangeEvent<HTMLInputElement>) {
        var attemptedStr = e.target.value;
        setStrValue(attemptedStr);

        var attemptedNumeric = e.target.valueAsNumber;
        if (isNaN(attemptedNumeric))
            return;

        setNumValue(attemptedNumeric);
        props.onChange?.(attemptedNumeric);
    }

    if (props.value != numValue) {
        setStrValue(props.value.toString());
        setNumValue(props.value);
    }

    return (
        <input type="number"
            value={strValue}
            onChange={onChange} />)

}

export var MemoizedInputNumber = React.memo(InputNumber) ;

