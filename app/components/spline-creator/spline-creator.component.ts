import { Component, OnInit } from '@angular/core';
import { Clipboard } from '@angular/cdk/clipboard';
import * as regression from 'regression';
import { max } from 'lodash';

interface IxyGraph {
  'x': number,
  'y': number
}

interface IplotlySplineGraph {
  x:number[],
  y:number[],
  type:string,
  name: string,
  mode:string,
  marker:{
    color:string,
    size:number
  }, 
  line:{
    dash:string,
    color:string,
    width:number
  }
}

@Component({
  selector: 'spline-creator',
  templateUrl: './spline-creator.component.html',
  styleUrls: ['./spline-creator.component.css']
})
export class SplineCreatorComponent implements OnInit {

  splineStart:number = 0;
  
  springSplineType:string = 'single';
  springCutStart:number = 0;
  springCutEnd:number = 0;
  fullSpringCopy:IxyGraph[] = [];
  pigtailSpringCopy:IxyGraph[] = [];
  engagedSpringCopy:IxyGraph[] = [];
  pasteBoxString:string = 'Click box and Paste Ride Rate Data Here'
  displayedColumns: string[] = [];
  dataSource: any[] = [];

  springGraph = {
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
      title: 'Spring Travel vs Spring Load',
      xaxis: {title: 'Spring Travel (in)', zeroline: false, showline: true, range: [-1, 1]},
      yaxis: {title: 'Spring Load (lbf)', zeroline: false, showline: true},
      margin: {
        l: 70,
        r: 50,
        b: 50,
        t: 50,
        pad: 0
      },
    },
  }
  list:any[] = []
  splineEnd:number = 0;
  pastedSpringDataPersist:IxyGraph[] = [];
  pastedSpringDataMod:IxyGraph[] = [];

  constructor(private clipboard: Clipboard) { }

  ngOnInit(): void {
  }

  public async findXMaxValue(data:IxyGraph[]) {
    let xValues: number[] = [];
    data.forEach((item) => {
      xValues.push(item.x);
    });
    let max:number = Math.ceil(Math.max(...xValues));
    return max
  }

  public fitLinearSpringStart(data:IxyGraph[]){
    const regression = require('regression');
    let fullSpline:IxyGraph[] = [];
    let fitData:number[][] = [];
    let secondPointX:number = data[1].x;
    data.forEach((item) => {
      if (item.x < secondPointX + 1){
        if (item.y !== undefined && !isNaN(item.y)) {
          fitData.push([item.x, item.y]);
        }
      }
    });

    const result = regression.polynomial(fitData, { order: 2 });
    fullSpline.push(data[0]);
    let count:number = .05;
    for (let i = 0 ; i < data.length - 1 ; i++) {
      if (count < secondPointX) {
        let predictObj:number[] = result.predict(count);
        fullSpline.push({x: predictObj[0], y:predictObj[1]});
        count = count + .05;
      }
    }

    data.forEach((item) => {
      if (item.x > secondPointX) {
        fullSpline.push(item)
      }
    })

    return fullSpline
  }

  public async pasteData(event:ClipboardEvent) {
    let clipboardData = event.clipboardData;
    if (clipboardData){
      this.fullSpringCopy = [];
      this.pigtailSpringCopy = [];
      this.engagedSpringCopy = [];
      let pastedText = clipboardData.getData('text');
      let row_data = pastedText.split('\n');
      let numberData1: IxyGraph[] =[];

      row_data.forEach((item)=>{
          let row:IxyGraph ={x: 0, y: 0};
          let item2 = item.substring(0, item.length - 1);
          let item3 = item2.split('\t').join(',');
          let item4 = item3.split(',');
          numberData1.push({x: +item4[0], y: +item4[1]});
      });
    this.pastedSpringDataPersist = numberData1;
    this.pasteBoxString = 'Data Pasted';
    }
    this.splineEnd = await this.findXMaxValue(this.pastedSpringDataPersist);
    this.pastedSpringDataPersist = await this.fitLinearSpringStart(this.pastedSpringDataPersist);
    this.pastedSpringDataMod = this.pastedSpringDataPersist;
    this.plotSpringSplineData();
  }

  public clearSpringSplineData(){
    this.pasteBoxString = 'Click box and Paste Ride Rate Data Here'
    this.pastedSpringDataMod = [];
    this.fullSpringCopy = [];
    this.pigtailSpringCopy = [];
    this.engagedSpringCopy = [];
    this.plotSpringSplineData();
  }

  public async checkAscendingValues(data:any[]){
    let dataFinal:any[] = [];
    dataFinal.push(data[0]); //push first value
    for (let i = 1; i <= data.length - 1; i++){
      if (data[i].x > data[i - 1].x){
        dataFinal.push(data[i]);
      }
    }
    return dataFinal
  }

  public async copyFullDataset(){
    this.fullSpringCopy = [];
    let finalCopy:any[] = [];
    this.fullSpringCopy = await this.checkAscendingValues(this.pastedSpringDataMod);
    let string = '';
    this.fullSpringCopy.forEach((item) => {
      let subString = item.x.toString() + '\t' + item.y.toString() + '\r';
      string = string + subString;
    });
    this.clipboard.copy(string);
    this.plotSpringSplineData();
  }

  

  public onSplineStart(event:any){
    let cut = +event.target.value;
    this.springCutStart = cut;
  }

  public onSplineEnd(event:any){
    let cut = +event.target.value;
    this.splineEnd = cut;
    let cutData:IxyGraph[] = [];
    this.pastedSpringDataMod = [];
    this.pastedSpringDataPersist.forEach((item) => {
      if (item.x < this.splineEnd){
        cutData.push(item)
      }
    });
    this.pastedSpringDataMod = cutData;
    this.plotSpringSplineData();
  }

  public copyPigtail() {

  }

  public copySpline() {

  }

  public plotSpringSplineData() {
    let springXMin: number = 0;
    let springXMax: number = 0;
    let springXPersist:number[] = [];
    let springYPersist:number[] = [];
    this.pastedSpringDataMod.forEach((item:IxyGraph) => {
      if (item.x !== undefined || item.y !== undefined) {
        springXPersist.push(item.x);
        springYPersist.push(item.y);
      }
    });
    springXMin = Math.min(...springXPersist) - .1;
    springXMax = Math.max(...springXPersist) + .1;
    
    let dataList:IplotlySplineGraph[] = []
    
    dataList = [ {
      x: springXPersist,
      y: springYPersist,
      type: 'scattergl',
      name: 'Spring Spline Data',
      mode: 'lines+markers',
      marker: {
        color: 'blue',
        size: 3
      },
      line: {
        dash: 'solid',
        color: 'blue',
        width: 1
      }
    }]
    

    this.springGraph = this.springGraph = {
      data: dataList,
      layout: 
        {autosize: true, showlegend: true, legend: {x: .2, y: -.2, "orientation": "h"},
        title: 'Spring Travel vs Spring Load',
        xaxis: {title: 'Spring Travel (in)', zeroline: false, showline: true, range: [springXMin, springXMax]},
        yaxis: {title: 'Spring Load (lbf)', zeroline: false, showline: true},
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
