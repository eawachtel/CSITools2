import { Component, OnInit } from '@angular/core';
import * as Papa from 'papaparse';

@Component({
  selector: 'shaft-spring-builder',
  templateUrl: './shaft-spring-builder.component.html',
  styleUrls: ['./shaft-spring-builder.component.css']
})
export class ShaftSpringBuilderComponent implements OnInit {
  displayedData:{x: number, y: number}[] = [];
  constructor() { }

  ngOnInit(): void {
  }

  public  async fileChangeListener(files: any) {
    let file = files.target.files[0];
    if (file) {
      Papa.parse(file, {
        header: false,
        skipEmptyLines: true,
        complete: async (result) => {
          this.displayedData =  await this.parseCSVFiletoXY(result.data);
          let plot = this.plotData();
        }
          });
    } else {
      alert('Problem loading CSV file');
    }
  }

  public async parseCSVFiletoXY(data:any[]){
    let indexedData:any[]=[];
    let indexStart:number = 0;
    data.forEach((item:any, index:number) => {
      if (item[0] === 'PR_Disp' && item[1] === 'PR_Force'){indexStart = index}
    });

    indexedData.push({x: +data[indexStart + 2][0], y: +data[indexStart + 2][1]}) // push first value as x:0 y:0
    for (let i = indexStart + 3; i <= data.length - 1; i++){
      if (+data[i][0] > +data[i - 1][0]){
        indexedData.push({x: +data[i][0], y: +data[i][1]})
      } else {break}
    
    }
    return indexedData
  }

  public plotData(){
    let x:number[] = [];
    let y:number[] = [];
    this.displayedData.forEach((item:{x:number, y:number}) => {
      x.push(item.x);
      y.push(item.y);
    });
  }
}
