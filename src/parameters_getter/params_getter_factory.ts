import { FileParamsGetter } from "./file_params_getter";
import { ParamsGetter } from "./params_getter";
import { StdinParamsGetter } from "./stdin_params_getter";

export enum ParamsSource {
    Stdin = 1,
    File,
}

export function InitializeParamsGetter(t: ParamsSource.Stdin): ParamsGetter<void>;
export function InitializeParamsGetter(t: ParamsSource.File): ParamsGetter<string>;
export function InitializeParamsGetter(t: ParamsSource): ParamsGetter<void> | ParamsGetter<string> {
    if (t === ParamsSource.File) {
        return new FileParamsGetter();
    }
    return new StdinParamsGetter();
}