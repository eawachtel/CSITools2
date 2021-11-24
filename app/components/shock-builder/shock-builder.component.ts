import { Component, OnInit } from '@angular/core';
import * as Papa from 'papaparse';

@Component({
  selector: 'shock-builder',
  templateUrl: './shock-builder.component.html',
  styleUrls: ['./shock-builder.component.css']
})
export class ShockBuilderComponent implements OnInit {
  displayedData:any[] = [];
  graph = {
    data: [
      {
        x: [0],
        y: [0],
        type: 'scattergl',
        name: '',
        mode: 'lines+markers',
        marker: {
          size: 2
        },
        line: {
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
          let returnedData:any =  await this.parseCSVFiletoXY(result.data);
          let plot = this.plotData(returnedData);
        }
          });
    } else {
      alert('Problem loading CSV file');
    }
  }

  public async parseCSVFiletoXY(data:any[]){
    let indexedData:any[]=[];
    let indexStart:number = 0;
    let headerList:string[] = [];
    let colorList:string[] = [];
    let dataDict:any = {};
    let xAxis:number[] = [];

    data.forEach((item:any, index:number) => {
      if (item[0] === 'Velocity'){
        indexStart = index + 2;
        for (let i = 1; i < item.length; i++){
          headerList.push(item[i]);
          dataDict[item[i]] = [];
        }
      }
    });

    for (let i = indexStart; i <= data.length - 1; i++){
      data[i].forEach((element:any, index:number) => {
        if (index === 0){
            xAxis.push(data[i][0]);
        } else {
          let key = headerList[ index - 1 ];
          dataDict[key].push(+element);
          let color:string = '';
          if (headerList[ index - 1 ] === ' CO' || headerList[ index - 1 ] === ' RO'){ color = 'black' };
          if (headerList[ index - 1 ] === ' CC' || headerList[ index - 1 ] === ' RC'){ color = 'blue' };
          if (headerList[ index - 1 ] === ' CA' || headerList[ index - 1 ] === ' RA'){ color = 'orange' };
          colorList.push(color);
        } 
      });
      
    }
    
    return { dataDict: dataDict, headerList: headerList, xAxis: xAxis, colorList: colorList}
  }

  public plotData(returnedData:any){
    let plotDataList: any = [];
    for (let i = 0; i < returnedData.headerList.length; i++){
      let plotObj = {
        x: returnedData.xAxis,
        y: returnedData.dataDict[returnedData.headerList[i]],
        type: 'scattergl',
        name: returnedData.headerList[i],
        mode: 'lines + markers',
        marker: {
          color: returnedData.colorList[i],
          size: 6
        },
        line: {
          color: returnedData.colorList[i],
          width: 2
        }
      }
      plotDataList.push(plotObj)
    }

    this.graph = {
      data: plotDataList,
      layout: 
        {autosize: true, showlegend: true, legend: {x: .38, y: -.2, "orientation": "h"},
        title: 'Displacement vs Load',
        xaxis: {title: 'Displacement (in)', automargin: true, zeroline: false, showline: true},
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

}
