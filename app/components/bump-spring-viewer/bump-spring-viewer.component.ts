import { Component, OnInit } from '@angular/core';
import * as Papa from 'papaparse';
import { Data } from 'plotly.js-dist-min';

@Component({
  selector: 'bump-spring-viewer',
  templateUrl: './bump-spring-viewer.component.html',
  styleUrls: ['./bump-spring-viewer.component.css']
})
export class BumpSpringViewerComponent implements OnInit {

  fileList: {index: number, fileName:string, x:number[], y:number[] }[] = 
  [
    {index: 0, fileName: '', x:[], y:[]},
    {index: 1, fileName: '', x:[], y:[]}
  ];
  loadedFileName: string = '';
  minLoadValue: number = 0;
  loadBtn:number = 0;
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
      {autosize: true, showlegend: true, legend: {x: .45, y: -.2, "orientation": "h"}, 
      title: 'Load vs Displacement',
      xaxis: {title: 'Displacement (in)', automargin: true, zeroline: false, showline: true},
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

  addButton(){

  }

  public async onFileClick(i:number){
    console.log('OnFileCLick Called')
    this.loadBtn = i;
    this.fileList[this.loadBtn] = {index: i, fileName: '', x:[], y:[]}
  }

  public  async fileChangeListener(files:any, i:number){
    let resetObject = await this.onFileClick(i);
    console.log('fileChangeLister Called')
    console.log(i)
    let file = files.target.files[0];
    let fileName = files.target.files[0].name;
    this.fileList[this.loadBtn].fileName = fileName;
    if (file) {
      Papa.parse(file, {
        header: false,
        skipEmptyLines: true,
        complete: async (result) => {
          let csvParse:{x:number, y:number}[] =  await this.parseCSVFiletoXY(result.data);
          let dataSeparate = await this.variableSeparate(csvParse);
          let test = 'test';
          // let plot = this.plotData();
        }
          });
    } else {
      alert('Problem loading CSV file');
    }
  }

  public async parseCSVFiletoXY(data:any[]){
    this.loadedFileName = data[1][1];
    let indexedData:any[]=[];
    let indexStart:number = 0;
    let zeroIndex:number = 0;
    let zeroLoad:number = 0;
    let zeroTravel:number = 0;
    data.forEach((item:any, index:number) => { //data iteration skips the empty rows in .csv between Motec header and first data row
      if (item[0] === 'PR_Disp' && item[1] === 'PR_Force'){indexStart = index}
    });
    for (let i=indexStart; i<= data.length; i++){
      if (data[i][1] >= this.minLoadValue){
        zeroIndex = i;
        zeroLoad = +data[i][1];
        zeroTravel = +data[i][0];
        break
      }
    }

    indexedData.push({x: zeroTravel - zeroTravel, y: zeroLoad - zeroLoad})
    for (let i = zeroIndex + 1; i <= data.length - 1; i++){
      let x = +data[i][0];
      let y = +data[i][1];
      if (+data[i][0] > +data[i - 1][0]){
        indexedData.push({x: data[i][0] - zeroTravel, y: data[i][1] - zeroLoad})
      }
    }
    
    return indexedData
  }

  public async variableSeparate(data:{x:number, y:number}[]){
    for (let j:number = 0; j < data.length; j++){
      this.fileList[this.loadBtn]['x'].push(data[j].x);
      this.fileList[this.loadBtn]['y'].push(data[j].y);
    }
    this.plotBumpSprings();
  }

  plotBumpSprings(){
    let dataList:any = [];
    this.fileList.forEach((item) => {
      let dataObj = 
        {
          x: item.x,
          y: item.y,
          type: 'scattergl',
          name: item.fileName,
          mode: 'lines+markers',
          marker: {
            size: 3
          },
          line: {
            width: 3
          }
        }
      dataList.push(dataObj);
    });
    
    this.graph = {
      data: dataList,
      layout: 
        {autosize: true, showlegend: true, legend: {x: .45, y: -.2, "orientation": "h"},
        title: 'Load vs Displacement',
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

