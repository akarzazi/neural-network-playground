import { Activation } from "./Activation";

export interface Layer {
    NodesCount: number;
    Activation?: Activation;
}