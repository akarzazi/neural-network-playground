import * as React from 'react';
import * as Color from '../../../helpers/Color';
import "./LabelScale.css"
import { Mathx } from '../../../../helpers/Mathx';

interface Props {
    min: number;
    max: number;
    minColor: Color.HSLA;
    maxColor: Color.HSLA;
}


export function LabelScale(props: Props) {

    function computeLinearGradient() {
        if (props.min == props.max)
            return Color.hslToString(props.minColor);

        var cssGradient = 'linear-gradient(0deg,';
        var steps = 10;
        for (let i = 0; i < steps; i++) {
            var valueRatio = i / (steps)
            var pointColor = Color.interpolateHSL(props.minColor, props.maxColor, valueRatio);
            var colorStr = Color.hslToString(pointColor);
            cssGradient += colorStr + ',';
        }
        cssGradient += Color.hslToString(props.maxColor) + ')';

        return cssGradient;
    }

    var roundedMin = Mathx.Round2Digits(props.min);
    var roundedMax = Mathx.Round2Digits(props.max);
    return (
        <div className="LabelScale">
            <div className="heat-scale" style={{
                background: computeLinearGradient(),
            }}></div>

            <div className="axis-container" >
                <span>{roundedMin}</span>
                <span>Label</span>
                <span>{roundedMax}</span>
            </div>

        </div >
    )

}