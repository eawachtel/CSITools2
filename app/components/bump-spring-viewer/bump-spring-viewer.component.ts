import { Component, OnInit } from '@angular/core';
import * as Papa from 'papaparse';

@Component({
  selector: 'bump-spring-viewer',
  templateUrl: './bump-spring-viewer.component.html',
  styleUrls: ['./bump-spring-viewer.component.css']
})
export class BumpSpringViewerComponent implements OnInit {

  fileList: { number:number, fileName:string, x:number[], y:number[] }[] = 
  [
    {number: 1, fileName: '', x:[], y:[]},
    {number: 2, fileName: '', x:[], y:[]}
  ];

  constructor() { }

  ngOnInit(): void {
  }

  addButton(){

  }

  public  async fileChangeListener(files:any, i:number){
    let file = files.target.files[0];
    let fileName = files.target.files[0].name;
    this.fileList[i].fileName = fileName;
    if (file) {
      Papa.parse(file, {
        header: false,
        skipEmptyLines: true,
        complete: async (result) => {
          let test = 'test'
          // this.displayedData =  await this.parseCSVFiletoXY(result.data, i);
          // let plot = this.plotData();
        }
          });
    } else {
      alert('Problem loading CSV file');
    }
  }
}
