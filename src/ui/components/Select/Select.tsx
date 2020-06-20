import * as React from 'react';
import { buildClassName } from '../../helpers/UiHelper';

type OptionValue = number | string

export interface SelectProps<T extends OptionValue> {
    name?: string;
    className?: string
    value?: T;
    onChange?: ((newValue: T) => void);
    placeholder?: string;
    options: SelectOptionProps<T>[];
    disabled?:boolean
}

export interface SelectOptionProps<T extends OptionValue> {
    value: T;
    label?: string

}

export class Select<T extends OptionValue> extends React.Component<SelectProps<T>, any>{

    constructor(props: SelectProps<T>) {
        super(props);
        this.onChange = this.onChange.bind(this);
    }

    onChange(e: React.ChangeEvent<HTMLSelectElement>) {
        const selectedIndex = e.currentTarget.selectedIndex;
        const selectedOption = this.props.options[selectedIndex];
        this.props.onChange?.(selectedOption.value);
    }

    render() {
        return (
            <div className={buildClassName(["Select", this.props.className])}>
                <select
                    name={this.props.name}
                    value={this.props.value}
                    onChange={this.onChange}
                    disabled={this.props.disabled}
                >
                    {this.props.options.map(option => {
                        return (
                            <option
                                key={option.value}
                                value={option.value}
                                label={option.label}>{option.label ?? option.value}
                            </option>
                        );
                    })}
                </select>
            </div>
        )
    }
}

