import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'CSITools';
  selectedApp = '';
  selectedAppFunction = '';
  
  setSpringTool(){
    this.selectedApp = 'Spring Spline Builder';
  }

  setDOETool(){
    this.selectedApp = 'DOE';
  }

  setBumpSpringTool(){
    this.selectedApp = 'Bump Spring Builder';
  }

  setShockTool(){
    this.selectedApp = 'Shock Builder'
  }
}
