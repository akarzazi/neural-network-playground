import { AdamOptimizerOptions } from "./AdamOptimizer";
import { SGDOptimizerOptions } from "./SGDOptimizer";

export type OptimizerOptions = SGDOptimizerOptions | AdamOptimizerOptions;

export interface Optimizer {
    AdjustWeights(): void;
}
