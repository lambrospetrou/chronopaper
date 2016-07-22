import * as React from "react";
import { BaseComponent } from './BaseComponent.tsx'

import { Hello } from './Hello.tsx';

export class RootApp extends BaseComponent<any, any> {
    render() {
        return (<Hello compiler="Typescript" framework="React" />);
    }
}