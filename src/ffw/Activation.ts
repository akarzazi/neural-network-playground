export interface Activation {
    id: ActivationType
    impl: (x: number) => number,
    der: (x: number) => number
}

export type ActivationType = KeysOfType<typeof Activations, Activation>;

export enum ActivationTypeEnum {
    TANH = "TANH",
    RELU = "RELU",
    LEAKYRELU = "LEAKYRELU",
    SIGMOID = "SIGMOID",
    LINEAR = "LINEAR",
    SWISH = "SWISH",
};

export class Activations {
    public static TANH: Activation = {
        id: "TANH",
        impl: x => Math.tanh(x),
        der: x => {
            let output = Activations.TANH.impl(x);
            return 1 - output * output;
        }
    };
    public static RELU: Activation = {
        id: "RELU",
        impl: x => Math.max(0, x),
        der: x => x <= 0 ? 0 : 1
    };

    public static LEAKYRELU: Activation = {
        id: "LEAKYRELU",
        impl: x => x <= 0 ? 0.01 * x : x,
        der: x => x <= 0 ? 0.01 : 1
    };

    public static SIGMOID: Activation = {
        id: "SIGMOID",
        impl: x => 1 / (1 + Math.exp(-x)),
        der: x => {
            let output = Activations.SIGMOID.impl(x);
            return output * (1 - output);
        }
    };
    public static LINEAR: Activation = {
        id: "LINEAR",
        impl: x => x,
        der: x => 1
    };

    public static SWISH: Activation = {
        id: "SWISH",
        impl: x => x / (1 + Math.exp(-x)),
        der: x => {
            let exp_x = Math.exp(-x);
            return (exp_x * (x + 1) + 1) / ((1 + exp_x) ** 2);
        }
    };

    public static GetById(id: ActivationType) {
        return Activations[id];
    }
}