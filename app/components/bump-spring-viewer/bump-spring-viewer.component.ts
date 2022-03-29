import { ThrowStmt } from '@angular/compiler';
import { Component, OnInit } from '@angular/core';
import * as Papa from 'papaparse';
import { Data } from 'plotly.js-dist-min';

@Component({
  selector: 'bump-spring-viewer',
  templateUrl: './bump-spring-viewer.component.html',
  styleUrls: ['./bump-spring-viewer.component.css']
})
export class BumpSpringViewerComponent implements OnInit {

  fileList: {fileName:string, x:number[], y:number[], hoverX: any, hoverY: any }[] = 
  [
    {fileName: '', x:[], y:[], hoverX: null, hoverY: null},
  ];
  hoverX?:any = null;
  hoverY?:any = null;
  loadedFileName: string = '';
  minLoadValue: number = 0;
  loadBtn:number = 0;
  maxX:number = 1.5;
  maxHoverX:number = 0;
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
      xaxis: {title: 'Displacement (in)', automargin: true, zeroline: false, showline: true, range:[0, 1.5]},
      yaxis: {title: 'Load (lbf)', zeroline: false, showline: true},
      shapes: [
        {
            type: 'line',
            xref: 'x',
            yref: 'y',
            x0: 0,
            y0: 0,
            x1: 0,
            y1: 0,
            line:{
                color: 'black',
                width: 1,
              }
        }
        ],
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
    this.fileList.push({fileName: '', x:[], y:[], hoverX: null, hoverY: null});
  }

  public removeFile(i:number){
    this.fileList.splice(i, 1);
    this.plotBumpSprings();
  }

  public async findMaxX(){
    let maxArr: number[] = [];
    this.fileList.forEach((item:any)=> {
      maxArr.push(Math.max(...item.x))
    });
    this.maxX = Math.max(...maxArr);
  }

  public async findHoverMaxX(){
    let maxArr: number[] = [];
    this.fileList.forEach((item:any)=> {
      maxArr.push(item.hoverX)
    });
    this.maxHoverX = Math.max(...maxArr);
  }

  public async onFileClick(i:number){
    this.loadBtn = i;
    this.fileList[this.loadBtn] = {fileName: '', x:[], y:[], hoverX: null, hoverY: null}
  }

  public  async fileChangeListener(files:any, i:number){
    let resetObject = await this.onFileClick(i);
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
    let maxX = await this.findMaxX();
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
    let shapes = this.getShapes();
    this.graph = {
      data: dataList,
      layout: 
        {autosize: true, showlegend: true, legend: {x: .45, y: -.2, "orientation": "h"},
        title: 'Load vs Displacement',
        xaxis: {title: 'Displacement (in)', automargin: true, zeroline: false, showline: true, range:[0, this.maxX + .05]},
        yaxis: {title: 'Load (lbf)', zeroline: false, showline: true},
        shapes: shapes,
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

  getShapes(){
    let shapeList = [];
    shapeList.push(
      {
        type: 'line',
        xref: 'x',
        yref: 'y',
        x0: 0,
        y0: this.hoverY,
        x1: this.maxHoverX,
        y1: this.hoverY,
        line:{
          color: 'black',
          width: 1
        }
      }
    )
    this.fileList.forEach((item:any) => {
      let shapeObj =
        {
          type: 'line',
          xref: 'x',
          yref: 'y',
          x0: item.hoverX,
          y0: 0,
          x1: item.hoverX,
          y1: this.hoverY,
          line:{
            color: 'black',
            width: 1
          }
        }
      shapeList.push(shapeObj);
    });
    console.log(shapeList);
    return shapeList
  }

  async onPlotlyHover(event:any){
    this.hoverX = event.xvals[0];
    this.hoverY = event.yvals[0];
    this.fileList.forEach((item:any) => {
      let closestY:any = this.findClosest(item.y, this.hoverY);
      item.hoverY = closestY;
      let index = item.y.indexOf(closestY);
      item.hoverX = item.x[index];
    });
    let maxHoverX = await this.findHoverMaxX()
    this.plotBumpSprings();
  }

  public findClosest(arr: number[], num:number) {
    if(arr == null) {
      return
    }
  
    let closest = arr[0];
    for(let item of arr){
      if(Math.abs(item - num)<Math.abs(closest - num)){
        closest = item;
      }
    }
    return closest;
  }

}

