import { Node } from "./Node";

export class Link {

    Id: string;
    Weight: number;
    Src: Node;
    Dest: Node;

    _back_errorDer: number = 0;
    _back_sumErrorDer: number = 0;
    _back_countErrorDer: number = 0;

    constructor(weight: number, src: Node, dest: Node) {
        this.Weight = weight;
        this.Src = src;
        this.Dest = dest;
        this.Id = src.Id + ' ->' + dest.Id;
    }

    ClearComputed() {
        this._back_errorDer = 0;
        this._back_sumErrorDer = 0;
        this._back_countErrorDer = 0;
    }
}