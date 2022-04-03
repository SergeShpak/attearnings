import { Parameters } from "../params"

export interface ParamsGetter<T> {
    GetParams(option: T): Promise<Parameters>
}
