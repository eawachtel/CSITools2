import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import {MatRadioModule} from '@angular/material/radio';
import {MatButtonModule} from '@angular/material/button';
import {MatTableModule} from '@angular/material/table';
import {MatTabsModule} from '@angular/material/tabs';
import {MatInputModule} from '@angular/material/input';
import * as PlotlyJS from 'plotly.js-dist-min';
import { PlotlyModule } from 'angular-plotly.js';


PlotlyModule.plotlyjs = PlotlyJS;
import {SpringSplineBuilderComponent} from './spring-spline-builder.component'


@NgModule({
  declarations: [
    SpringSplineBuilderComponent
  ],
  imports: [
    CommonModule,
    BrowserModule,
    MatRadioModule,
    MatButtonModule,
    MatTabsModule,
    MatTableModule,
    MatInputModule,
    PlotlyModule,
    FormsModule
  ],
  exports: [
    SpringSplineBuilderComponent
  ]
})
export class SpringSplineBuilderModule { }
