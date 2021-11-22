import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {MatButtonModule} from '@angular/material/button';
import * as PlotlyJS from 'plotly.js-dist-min';
import { PlotlyModule } from 'angular-plotly.js';

import {ShaftSpringBuilderComponent} from '../shaft-spring-builder/shaft-spring-builder.component'


@NgModule({
  declarations: [
    ShaftSpringBuilderComponent
  ],
  imports: [
    CommonModule,
    MatButtonModule,
    PlotlyModule
  ],
  exports: [
    ShaftSpringBuilderComponent
  ]
})
export class ShaftSpringBuilderModule { }
