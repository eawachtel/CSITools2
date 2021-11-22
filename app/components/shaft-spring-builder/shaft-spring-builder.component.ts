import { Component, OnInit } from '@angular/core';
import { Clipboard } from '@angular/cdk/clipboard';
import * as Papa from 'papaparse';

@Component({
  selector: 'shaft-spring-builder',
  templateUrl: './shaft-spring-builder.component.html',
  styleUrls: ['./shaft-spring-builder.component.css']
})
export class ShaftSpringBuilderComponent implements OnInit {
  displayedData:{x: number, y: number}[] = [];
  graph = {
    data: [
      {
        x: [0],
        y: [0],
        type: 'scattergl',
        name: '',
        mode: 'lines+markers',
        marker: {
          color: 'blue',
          size: 2
        },
        line: {
          color: 'blue',
          width: 2
        }
      }
    ],
    layout: 
      {autosize: true, showlegend: true, legend: {x: .2, y: -.2, "orientation": "h"}, 
      title: 'Travel vs Load',
      xaxis: {title: 'Travel (in)', automargin: true, zeroline: false, showline: true},
      yaxis: {title: 'Load (lbf)', zeroline: false, showline: true},
      margin: {
        l: 70,
        r: 50,
        b: 50,
        t: 50,
        pad: 0
      },
    },
  }
  constructor(private clipboard: Clipboard) { }

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

    let dataList = [
      {
        x: x,
        y: y,
        type: 'scattergl',
        name: 'Pulldown Data',
        mode: 'markers',
        marker: {
          color: 'blue',
          size: 3
        },
        line: {
          color: 'blue',
          width: 2
        }
      }
    ]
    this.graph = {
      data: dataList,
      layout: 
        {autosize: true, showlegend: true, legend: {x: .2, y: -.2, "orientation": "h"},
        title: 'Displacement vs Load',
        xaxis: {title: 'Travel (in)', automargin: true, zeroline: false, showline: true},
        yaxis: {title: 'Load (lbf)', zeroline: false, showline: true},
        margin: {
          l: 70,
          r: 50,
          b: 50,
          t: 50,
          pad: 0
        }
      }
    };
  }

  public copySplineDataToClip(){
    let string = '';
    this.displayedData.forEach((item) => {
      let subString = item['x'].toString() + '\t' + item['y'].toString() + '\t' +
      item['y'].toString() + '\r';
      string = string + subString;
    });
    this.clipboard.copy(string);
  }
}
