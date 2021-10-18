import { Component, OnInit } from '@angular/core';
import { Clipboard } from '@angular/cdk/clipboard';
import * as regression from 'regression';


interface IxyGraph {
  'x': number,
  'y': number
}

interface IplotlyGraph {
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
    color:string,
    width:number
  }
}


@Component({
  selector: 'spring-spline-builder',
  templateUrl: './spring-spline-builder.component.html',
  styleUrls: ['./spring-spline-builder.component.css']
})
export class SpringSplineBuilderComponent implements OnInit {
  
  
  val:any;
  displayedColumns: string[] = [];
  dataSource: any[] = [];


  fileTypeSelect: string = 'single';
  pulldownDataPersist: {'LF Shock Travel': number, 'LF Wheel Load': number, 'RF Shock Travel': number, 'RF Wheel Load': number}[]= [];
  side:string|undefined = undefined;
  lfFullPersist:IxyGraph[] = [];
  lfTopPersist:IxyGraph[] = []
  lfBottomPersist:IxyGraph[] = [];
  lfCopiedData:IxyGraph[] = [];
  lfTopMod:IxyGraph[] = []
  lfBottomMod:IxyGraph[] = [];
  
  rfFullPersist:IxyGraph[] = [];
  rfTopPersist:IxyGraph[] = []
  rfBottomPersist:IxyGraph[] = [];
  rfCopiedData:IxyGraph[] = [];
  rfTopMod:IxyGraph[] = []
  rfBottomMod:IxyGraph[] = [];

  lfSide:string|undefined = undefined;
  lfOffsetValue:number = 0;
  lfOffsetFactor:number = 0;
  lfCurveSelect:string|undefined = undefined;

  rfSide:string|undefined = undefined;
  rfOffsetValue:number = 0;
  rfOffsetFactor:number = 0;
  rfCurveSelect:string|undefined = undefined;
  
  lfGraph = {
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
      title: 'LF Shock vs LF Load',
      xaxis: {title: 'LF Shock Travel (in)', automargin: true, zeroline: false, showline: true, range: [0, 5]},
      yaxis: {title: 'LF Load (lbf)', zeroline: false, showline: true},
      margin: {
        l: 70,
        r: 50,
        b: 50,
        t: 50,
        pad: 0
      },
    },
  }
  rfGraph = {
    data: [{
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
    }],
    layout: {
      autosize: true, showlegend: true, legend: {x: .2, y: -.2, "orientation": "h"},
      title: 'RF Shock vs RF Load',
      xaxis: {title: 'RF Shock Travel (in)', zeroline: false, showline: true, range: [0, 5]},
      yaxis: {title: 'RF Load (lbf)', zeroline: false, showline: true},
      margin: {
        l: 70,
        r: 50,
        b: 50,
        t: 50,
        pad: 0
      },
    }
  };
  list:any[] = []

  constructor(private clipboard: Clipboard) { }

  ngOnInit(): void {
  }

  public lfFileChangeListener(files:any){
    let file = files.target.files[0];
    if (file) {
      let data1: string[] = [];
      const reader= new FileReader
      reader.readAsText(file)
      reader.onload = function () {
        if(reader.result){
            let fileString = reader.result as string;
            let lines: string[] = fileString.split('\n')
            for (let i = 10; i < lines.length; i++){
              data1.push(lines[i])
            }
        }
      }
      reader.onloadend = () => this.parseLFFileString(data1);
    }
  }

  public rfFileChangeListener(files:any){
    let file = files.target.files[0];
    if (file) {
      let data1: string[] = [];
      const reader= new FileReader
      reader.readAsText(file)
      reader.onload = function () {
        if(reader.result){
            let fileString = reader.result as string;
            let lines: string[] = fileString.split('\n')
            for (let i = 10; i < lines.length; i++){
              data1.push(lines[i])
            }
        }
      }
      reader.onloadend = () => this.parseRFFileString(data1);
    }
  }

  public singleFileChangeListener(files:any){
    let file = files.target.files[0];
    if (file) {
      let data1: string[] = [];
      const reader= new FileReader
      reader.readAsText(file)
      reader.onload = function () {
        if(reader.result){
            let fileString = reader.result as string;
            let lines: string[] = fileString.split('\n')
            for (let i = 10; i < lines.length; i++){
              data1.push(lines[i])
            }
        }
      }
      reader.onloadend = () => this.parseSingleFileString(data1);
    }
    
  }

  public async parseLFFileString(data1:any[]){
    //Takes read text and get list of keys or headers from pulldown file
    let keyList = data1[0];
    let keyList2 = keyList.substring(0, keyList.length - 1);
    let keyList3 = keyList2.split('\t').join(',');
    let keys = keyList3.split(',');
    let usedChannelsDict: any = {}
    let usedChannelsIndexList: number[] = [];
    let usedChannels: string[] = ['LF Shock Travel', 'LF Wheel Load'];
    keys.forEach((item: string, index:number) => {
      if (usedChannels.includes(item)) {
        let key = index
        usedChannelsDict[key] = item;
        usedChannelsIndexList.push(index);
      }
    });

    //create clean dataset of numbers
    data1.splice(0, 1)
    let numberData1:number[][] = [];
    data1.forEach((item:string) => {
      let item2 = item.substring(0, item.length - 1);
      let item3 = item2.split('\t').join(',');
      let item4 = item3.split(',');
      let elementList: number[] = [];
      item4.forEach((element:string) => {
        elementList.push(+element);
      });
      numberData1.push(elementList);
    });

    //Pull header columns for RRS VES (shock & Load)
    let lfData:any[] = [];
    numberData1.forEach((item:number[]) => {
      let dataObj: any = {};
      item.forEach((element:number, index:number) => {
        if (usedChannelsIndexList.includes(index)){
          let channelKey: string = usedChannelsDict[index];
          let value:number = item[index];
          dataObj[channelKey] = value;
        }
      });
      lfData.push(dataObj);
    });
    
    
    this.lfFullPersist = await this.createLFFullPersist(lfData);
    //Find Max Value of Dataset
    let xArr:number[] = [];
    this.lfFullPersist.forEach((item:IxyGraph) => {
      xArr.push(item.x)
    })
    let lfXMax:number = Math.max(...xArr)

    //Top Data Set
    this.lfTopPersist = this.solveTopCurve(this.lfFullPersist, lfXMax);
    // this.lfTopMod = this.lfTopPersist;

    //Bottom Data Set
    this.lfBottomPersist = this.solveBottomCurve(this.lfFullPersist, lfXMax);
    this.lfCurveSelect = 'full';
    this.plotLFPulldownData(this.lfFullPersist);
  }
  
  public async parseRFFileString(data1:any[]){
    //Takes read text and get list of keys or headers from pulldown file
    let keyList = data1[0];
    let keyList2 = keyList.substring(0, keyList.length - 1);
    let keyList3 = keyList2.split('\t').join(',');
    let keys = keyList3.split(',');
    let usedChannelsDict: any = {}
    let usedChannelsIndexList: number[] = [];
    let usedChannels: string[] = ['RF Shock Travel', 'RF Wheel Load'];
    keys.forEach((item: string, index:number) => {
      if (usedChannels.includes(item)) {
        let key = index
        usedChannelsDict[key] = item;
        usedChannelsIndexList.push(index);
      }
    });

    //create clean dataset of numbers
    data1.splice(0, 1)
    let numberData1:number[][] = [];
    data1.forEach((item:string) => {
      let item2 = item.substring(0, item.length - 1);
      let item3 = item2.split('\t').join(',');
      let item4 = item3.split(',');
      let elementList: number[] = [];
      item4.forEach((element:string) => {
        elementList.push(+element);
      });
      numberData1.push(elementList);
    });

    //Pull header columns for RRS VES (shock & Load)
    let rfData:any[] = [];
    numberData1.forEach((item:number[]) => {
      let dataObj: any = {};
      item.forEach((element:number, index:number) => {
        if (usedChannelsIndexList.includes(index)){
          let channelKey: string = usedChannelsDict[index];
          let value:number = item[index];
          dataObj[channelKey] = value;
        }
      });
      rfData.push(dataObj);
    });
    
    
    this.rfFullPersist = await this.createRFFullPersist(rfData);
    
    //Find Max Value of Dataset
    let xArr:number[] = [];
    this.rfFullPersist.forEach((item:IxyGraph) => {
      xArr.push(item.x)
    })
    let rfXMax:number = Math.max(...xArr)

    //Top Data Set
    this.rfTopPersist = this.solveTopCurve(this.rfFullPersist, rfXMax);
    // this.lfTopMod = this.lfTopPersist;

    //Bottom Data Set
    this.rfBottomPersist = this.solveBottomCurve(this.rfFullPersist, rfXMax);
    this.rfCurveSelect = 'full';
    this.plotRFPulldownData(this.rfFullPersist);
  }

  public parseSingleFileString(data1:any[]){
    //Takes read text and get list of keys or headers from pulldown file
    let keyList = data1[0];
    let keyList2 = keyList.substring(0, keyList.length - 1);
    let keyList3 = keyList2.split('\t').join(',');
    let keys = keyList3.split(',');
    let usedChannelsDict: any = {}
    let usedChannelsIndexList: number[] = [];
    let usedChannels: string[] = ['LF Shock Travel', 'LF Wheel Load', 'RF Shock Travel', 'RF Wheel Load'];
    keys.forEach((item: string, index:number) => {
      if (usedChannels.includes(item)) {
        let key = index
        usedChannelsDict[key] = item;
        usedChannelsIndexList.push(index);
      }
    });

    //create clean dataset of numbers
    data1.splice(0, 1)
    let numberData1:number[][] = [];
    data1.forEach((item:string) => {
      let item2 = item.substring(0, item.length - 1);
      let item3 = item2.split('\t').join(',');
      let item4 = item3.split(',');
      let elementList: number[] = [];
      item4.forEach((element:string) => {
        elementList.push(+element);
      });
      numberData1.push(elementList);
    });
    
    //Pull header columns for RRS VES (shock & Load)
    this.pulldownDataPersist = [];
    numberData1.forEach((item:number[]) => {
      let dataObj: any = {};
      item.forEach((element:number, index:number) => {
        if (usedChannelsIndexList.includes(index)){
          let channelKey: string = usedChannelsDict[index];
          let value:number = item[index];
          dataObj[channelKey] = value;
        }
      });
      this.pulldownDataPersist.push(dataObj);
    });
    //create function to check for increasing x values then call this.plotPulldownData
    this.separateLFRFData();
  }
  
  public solveTopCurve(fullData:IxyGraph[], xMax:number){
    let topCurveData: IxyGraph[] = [];
    for (let i = 0; i < fullData.length; i++) {
      if (fullData[i].x > 0) {
        let obj:IxyGraph = {'x': fullData[i].x, 'y': fullData[i].y};
        topCurveData.push(obj);
        if (fullData[i].x === xMax) break;
      }
    }
    
    return topCurveData;
  }

  public solveBottomCurve(fullData:IxyGraph[], xMax:number){
    let bottomCurveData: IxyGraph[] = [];
    for (let i = fullData.length - 1; i >= 0; i--) {
      if (fullData[i].x > 0) {
        let obj:IxyGraph = {'x': fullData[i].x, 'y': fullData[i].y};
        bottomCurveData.push(obj);
        if (fullData[i].x === xMax) break;
      }
    }
    
    return bottomCurveData;
  }

  public async createLFFullPersist(data:any[]){
    //Full Data Set
    let dataNew:any[] = [];
    data.forEach((item:any) => {
      let obj: IxyGraph = {'x': item['LF Shock Travel'], 'y':item['LF Wheel Load']};
      if (obj.x !== undefined || obj.y !== undefined) {
        dataNew.push(obj);
      }
    });

    return dataNew;
  }

  public async createRFFullPersist(data:any[]){
    //Full Data Set
    let dataNew:any[] = [];
    data.forEach((item:any) => {
      let obj: IxyGraph = {'x': item['RF Shock Travel'], 'y':item['RF Wheel Load']};
      if (obj.x !== undefined || obj.y !== undefined) {
        dataNew.push(obj);
      }
    });

    return dataNew;
  }

  public async separateLFRFData(){
    
    
    let testObj: any = this.pulldownDataPersist[0];
    let testObjList: string[] = Object.keys(testObj);
    if (testObjList.includes('LF Shock Travel') && testObjList.includes('LF Wheel Load')){
      this.lfFullPersist = [];
      this.lfTopPersist = [];
      this.lfBottomPersist = [];

      //Full Data Set
      this.lfFullPersist = await this.createLFFullPersist(this.pulldownDataPersist);

      //Find Max Value of Dataset
      let xArr:number[] = [];
      this.lfFullPersist.forEach((item:IxyGraph) => {
        xArr.push(item.x)
      })
      let lfXMax:number = Math.max(...xArr)
      //Top Data Set
      this.lfTopPersist = this.solveTopCurve(this.lfFullPersist, lfXMax);
      // this.lfTopMod = this.lfTopPersist;

      //Bottom Data Set
      this.lfBottomPersist = this.solveBottomCurve(this.lfFullPersist, lfXMax);
      // this.lfBottomMod = this.lfBottomPersist;
    }
    
    if (testObjList.includes('RF Shock Travel') && testObjList.includes('RF Wheel Load')){
      this.rfFullPersist = [];
      this.rfTopPersist = [];
      this.rfBottomPersist = [];

      //Full Data Set
      this.rfFullPersist = await this.createRFFullPersist(this.pulldownDataPersist);
      
      //Find Max Value of Dataset
      let xArr:number[] = [];
      this.rfFullPersist.forEach((item:IxyGraph) => {
        xArr.push(item.x)
      })
      let rfXMax:number = Math.max(...xArr)
      //Top Data Set
      this.rfTopPersist = this.solveTopCurve(this.rfFullPersist, rfXMax);
      // this.rfTopMod = this.rfTopPersist;

      //Bottom Data Set
      this.rfBottomPersist = this.solveBottomCurve(this.rfFullPersist, rfXMax);
      // this.rfBottomMod = this.rfBottomPersist;
    }

    this.lfCurveSelect = 'full';
    this.rfCurveSelect = 'full';
    this.plotLFPulldownData(this.lfFullPersist);
    this.plotRFPulldownData(this.rfFullPersist);
  }

  public onOffset(event:any, side:string){
    let offset = +event.target.value;
    if (side === 'LF') {
      this.lfOffsetValue = offset;
      switch(this.lfCurveSelect){
        case 'top':
          this.onTopCurveSelect(side = 'LF')
          break
        case 'bottom':
          this.onBottomCurveSelect(side = 'LF')
          break
        case 'copied':
          this.lfCurveSelect = 'full'
          this.plotLFPulldownData(this.lfFullPersist);
      }
    }
    if (side === 'RF') {
      this.rfOffsetValue = offset;
      switch(this.rfCurveSelect){
        case 'top':
          this.onTopCurveSelect(side = 'RF')
          break
        case 'bottom':
          this.onBottomCurveSelect(side = 'RF')
          break
        case 'copied':
          this.rfCurveSelect = 'full'
          this.plotRFPulldownData(this.rfFullPersist);
      }
    }
  }

  public offset(data:IxyGraph[], offset:number, side:string){
    const regression = require('regression');
    let predictedVal:number;
    
    let polyFitData: number[][] = [];
      //find value greater that 1in shock travel and get index
      for (let i = 0; i < data.length; i++){
        if (data[i].x > -.1) { polyFitData.push([data[i].x, data[i].y]) }; 
        if (data[i].x > .5) { break };
      }
      const result = regression.polynomial(polyFitData, { order: 2 });
      let predictVals:number[] = result.predict(0);
      let predictedX:number = predictVals[1]
      let offsetFactor:number = offset - predictedX;
      switch(side){
        case 'LF':
          this.lfOffsetFactor = offsetFactor;
          break
        case 'RF':
          this.rfOffsetFactor = offsetFactor;
          break
      }
      let offsetData: IxyGraph[] = [];
      data.forEach((item:IxyGraph) => {
        offsetData.push({x: item.x, y: item.y + offsetFactor})
      })
      return offsetData
  }

  public onBottomCurveSelect(side:string) {
    if (side === 'LF') {
      this.lfCurveSelect = 'bottom';
      if (this.rfCurveSelect === 'copied') {
        this.rfCurveSelect = 'full';
        this.plotRFPulldownData(this.rfFullPersist);
      }
      if (this.lfOffsetValue > 0) {
        this.lfBottomMod = this.offset(this.lfBottomPersist, this.lfOffsetValue, side);
      } else {
        this.lfBottomMod = this.lfBottomPersist;
      }
      this.plotLFPulldownData(this.lfBottomMod);
    }
    if (side === 'RF') {
      this.rfCurveSelect = 'bottom';
      if (this.lfCurveSelect === 'copied') {
        this.lfCurveSelect = 'full';
        this.plotLFPulldownData(this.lfFullPersist);
      }
      if (this.rfOffsetValue > 0) {
        this.rfBottomMod = this.offset(this.rfBottomPersist, this.rfOffsetValue, side);
      } else {
        this.rfBottomMod = this.rfBottomPersist;
      }
      this.plotRFPulldownData(this.rfBottomMod);
    }
  }

  public onTopCurveSelect(side:string) {
    if (side === 'LF') {
      this.lfCurveSelect = 'top';
      if (this.rfCurveSelect === 'copied') {
        this.rfCurveSelect = 'full';
        this.plotRFPulldownData(this.rfFullPersist);
      }
      if (this.lfOffsetValue > 0) {
        this.lfTopMod = this.offset(this.lfTopPersist, this.lfOffsetValue, side);
      } else {
        this.lfTopMod = this.lfTopPersist;
      }
      this.plotLFPulldownData(this.lfTopMod);
    }
    if (side === 'RF') {
      this.rfCurveSelect = 'top';
      if (this.lfCurveSelect === 'copied') {
        this.lfCurveSelect = 'full';
        this.plotLFPulldownData(this.lfFullPersist);
      }
      if (this.rfOffsetValue > 0) {
        this.rfTopMod = this.offset(this.rfTopPersist, this.rfOffsetValue, side);
      } else {
        this.rfTopMod = this.rfTopPersist;
      }
      this.plotRFPulldownData(this.rfTopMod);
    }
  }

  public plotLFPulldownData(plotData:IxyGraph[]) {

    // create full persist dataset no matter selection
    let lfXMin: number = 0;
    let lfXMax: number = 0;
    let lfXPersist:number[] = [];
    let lfYPersist:number[] = [];
    this.lfFullPersist.forEach((item:IxyGraph) => {
      if (item.x !== undefined || item.y !== undefined) {
        lfXPersist.push(item.x);
        lfYPersist.push(item.y);
      }
    });
    lfXMin = Math.min(...lfXPersist) - .1;
    lfXMax = Math.max(...lfXPersist) + .1;
    
    let dataList:IplotlyGraph[] = []
    if (this.lfCurveSelect === 'full'){
      dataList = [
        {
          x: lfXPersist,
          y: lfYPersist,
          type: 'scattergl',
          name: 'Pulldown Data',
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
      ]
    }
    if (this.lfCurveSelect !== 'full'){
      let lfx:number[] = [];
      let lfy:number[] = [];
      plotData.forEach((item:IxyGraph) => {
        if (item.x !== undefined || item.y !== undefined) {
          // if (item.x > 0){
            lfx.push(item.x);
            lfy.push(item.y);
          // }
        }
      });
      let altColor:string = '';
      let altName:string = '';
      if (this.lfCurveSelect === 'copied') { 
        altColor = 'black' 
        altName = 'Copied Data'
      } else { 
        altColor = 'red'
        altName = 'Selected Data'
      }
      dataList = [
        {
          x: lfXPersist,
          y: lfYPersist,
          type: 'scattergl',
          name: 'Pulldown Data',
          mode: 'lines+markers',
          marker: {
            color: 'blue',
            size: 2
          },
          line: {
            color: 'blue',
            width: 2
          }
        },
        {
          x: lfx,
          y: lfy,
          type: 'scattergl',
          name: altName,
          mode: 'lines+markers',
          marker: {
            color: altColor,
            size: 3
          },
          line: {
            color: altColor,
            width: 3
          }
        }
      ]
    }
    
      
    this.lfGraph = this.lfGraph = {
      data: dataList,
      layout: 
        {autosize: true, showlegend: true, legend: {x: .2, y: -.2, "orientation": "h"}, 
        title: 'LF Shock vs LF Load',
        xaxis: {title: 'LF Shock Travel (in)', automargin: true, zeroline: false, showline: true, range: [lfXMin, lfXMax]},
        yaxis: {title: 'LF Load (lbf)', zeroline: false, showline: true},
        margin: {
          l: 70,
          r: 50,
          b: 50,
          t: 50,
          pad: 0
        }
      }
    };
    //Call table to copy to RRS
   }
  
  public solveLFIndexedBottomData(length:number){
    let nonZeroPersist:any[] = [];
    let indexedLongData:any[]=[];
    let count:number = 0;
    for (let i = 0; i <= this.lfFullPersist.length - 1; i++) {
      if (this.lfFullPersist[i].x > 0) {
        nonZeroPersist.push(this.lfFullPersist[i])
      }
    }
    for (let i = nonZeroPersist.length - 1; i > 0; i--) {
      if (count <= length){
        let obj:IxyGraph = {x: nonZeroPersist[i].x, y: nonZeroPersist[i].y + this.lfOffsetFactor};
        indexedLongData.push(obj);
        count = count + 1;
      }
    }

    return indexedLongData;
  }

  public solveLFIndexedTopData(length:number){
    let nonZeroPersist:any[] = [];
    let indexedLongData:any[]=[];
    let count:number = 0;
    for (let i = 0; i <= this.lfFullPersist.length - 1; i++) {
      if (this.lfFullPersist[i].x > 0) {
        nonZeroPersist.push(this.lfFullPersist[i])
      }
    }
    for (let i = 0; i <= nonZeroPersist.length - 1; i++) {
      if (count <= length){
        let obj:IxyGraph = {x: nonZeroPersist[i].x, y: nonZeroPersist[i].y + this.lfOffsetFactor};
        indexedLongData.push(obj);
        count = count + 1;
      }
    }

    return indexedLongData;
  }

  public solveRFIndexedBottomData(length:number){
    let nonZeroPersist:any[] = [];
    let indexedLongData:any[]=[];
    let count:number = 0;
    for (let i = 0; i <= this.rfFullPersist.length - 1; i++) {
      if (this.rfFullPersist[i].x > 0) {
        nonZeroPersist.push(this.rfFullPersist[i])
      }
    }
    for (let i = nonZeroPersist.length - 1; i > 0; i--) {
      if (count <= length){
        let obj:IxyGraph = {x: nonZeroPersist[i].x, y: nonZeroPersist[i].y + this.rfOffsetFactor};
        indexedLongData.push(obj);
        count = count + 1;
      }
    }

    return indexedLongData;
  }

  public solveRFIndexedTopData(length:number){
    let nonZeroPersist:any[] = [];
    let indexedLongData:any[]=[];
    let count:number = 0;
    for (let i = 0; i <= this.rfFullPersist.length - 1; i++) {
      if (this.rfFullPersist[i].x > 0) {
        nonZeroPersist.push(this.rfFullPersist[i])
      }
    }
    for (let i = 0; i <= nonZeroPersist.length - 1; i++) {
      if (count <= length){
        let obj:IxyGraph = {x: nonZeroPersist[i].x, y: nonZeroPersist[i].y + this.rfOffsetFactor};
        indexedLongData.push(obj);
        count = count + 1;
      }
    }

    return indexedLongData;
  }

  public async copyDataToClip(){
    if (this.lfCurveSelect === 'full' || this.rfCurveSelect == 'full'){
      alert('Select a Top and Bottom from each side') 
      return
    };
    let lfData:IxyGraph[] = [];
    let rfData:IxyGraph[] = [];
    let indexedLongData: IxyGraph[] = [];
    let combinedData:any[] = [];

    switch(this.lfCurveSelect){
        case 'top':
          lfData = this.lfTopMod;
          break;
        case 'bottom':
          lfData = this.lfBottomMod;
          break;
    }
    switch(this.rfCurveSelect){
      case 'top':
        rfData = this.rfTopMod;
        break;
      case 'bottom':
        rfData = this.rfBottomMod;
        break;
    }
    if (lfData.length > rfData.length) {
      switch(this.rfCurveSelect) {
        case 'bottom':
          indexedLongData = this.solveRFIndexedBottomData(lfData.length);
          break;
        case 'top':
          indexedLongData = this.solveRFIndexedTopData(lfData.length);
          break;
      }
      this.lfCurveSelect = 'copied'
      this.plotLFPulldownData(lfData);
      this.rfCurveSelect = 'copied'
      this.plotRFPulldownData(indexedLongData)
      for (let i = 0; i < lfData.length; i++) {
        let obj:{} = {'LF Shock Travel': lfData[i].x, 'LF Wheel Load': lfData[i].y, 'RF Shock Travel': indexedLongData[i].x, 'RF Wheel Load': indexedLongData[i].y}
        combinedData.push(obj);
      }
    }

    if (rfData.length > lfData.length) {
      switch(this.lfCurveSelect) {
        case 'bottom':
          indexedLongData = this.solveLFIndexedBottomData(rfData.length);
          break;
        case 'top':
          indexedLongData = this.solveLFIndexedTopData(rfData.length);
          break;
      }
      this.rfCurveSelect = 'copied'
      this.plotRFPulldownData(rfData);
      this.lfCurveSelect = 'copied'
      this.plotLFPulldownData(indexedLongData)
      for (let i = 0; i < rfData.length; i++) {
        let obj:{} = {'LF Shock Travel': indexedLongData[i].x, 'LF Wheel Load': indexedLongData[i].y, 'RF Shock Travel': rfData[i].x, 'RF Wheel Load': rfData[i].y}
        combinedData.push(obj);
      }
    }

    if (rfData.length === lfData.length){
      try {
        for (let i = 0; i <= rfData.length -1; i++) {
          let obj:{} = {'LF Shock Travel': lfData[i].x, 'LF Wheel Load': lfData[i].y, 'RF Shock Travel': rfData[i].x, 'RF Wheel Load': rfData[i].y}
          combinedData.push(obj);
        }
        this.rfCurveSelect = 'copied'
        this.plotRFPulldownData(rfData);
        this.lfCurveSelect = 'copied'
        this.plotLFPulldownData(lfData)
      } catch (error) {
        console.log(error);
      }
    }
    
    let string = '';
    combinedData.forEach((item) => {
      let subString = item['LF Shock Travel'].toString() + '\t' + item['LF Wheel Load'].toString() + '\t' +
      item['RF Shock Travel'].toString() + '\t' + item['RF Wheel Load'].toString() +'\r';
      string = string + subString;
    });
    this.clipboard.copy(string);
   }

  public plotRFPulldownData(plotData:IxyGraph[]) {

    // create full persist dataset no matter selection
    let rfXMin: number = 0;
    let rfXMax: number = 0;
    let rfXPersist:number[] = [];
    let rfYPersist:number[] = [];
    this.rfFullPersist.forEach((item:IxyGraph) => {
      if (item.x !== undefined || item.y !== undefined) {
        rfXPersist.push(item.x);
        rfYPersist.push(item.y);
      }
    });
    rfXMin = Math.min(...rfXPersist) - .1;
    rfXMax = Math.max(...rfXPersist) + .1;
    
    let dataList:IplotlyGraph[] = []
    if (this.rfCurveSelect === 'full'){
      dataList = [ {
        x: rfXPersist,
        y: rfYPersist,
        type: 'scattergl',
        name: 'Pulldown Data',
        mode: 'lines+markers',
        marker: {
          color: 'blue',
          size: 2
        },
        line: {
          color: 'blue',
          width: 2
        }
      }]
    }
    if (this.rfCurveSelect !== 'full'){
      let rfx:number[] = [];
      let rfy:number[] = [];
      plotData.forEach((item:IxyGraph) => {
        if (item.x !== undefined || item.y !== undefined) {
          if (item.x > 0){
            rfx.push(item.x);
            rfy.push(item.y);
         }
        } 
      });
      let altColor:string = '';
      let altName:string = '';
      if (this.rfCurveSelect === 'copied') { 
        altColor = 'black' 
        altName = 'Copied Data'
      } else { 
        altColor = 'red'
        altName = 'Selected Data'
      }
      dataList = [{
        x: rfXPersist,
        y: rfYPersist,
        type: 'scattergl',
        name: 'Pulldown Data',
        mode: 'lines+markers',
        marker: {
          color: 'blue',
          size: 2
        },
        line: {
          color: 'blue',
          width: 2
        }
      },
      {
        x: rfx,
        y: rfy,
        type: 'scattergl',
        name: altName,
        mode: 'lines+markers',
        marker: {
          color: altColor,
          size: 3
        },
        line: {
          color: altColor,
          width: 3
        }
      }
    ]
    }
      
    this.rfGraph = this.rfGraph = {
      data: dataList,
      layout: 
        {autosize: true, showlegend: true, legend: {x: .2, y: -.2, "orientation": "h"},
        title: 'RF Shock vs RF Load',
        xaxis: {title: 'RF Shock Travel (in)', zeroline: false, showline: true, range: [rfXMin, rfXMax]},
        yaxis: {title: 'RF Load (lbf)', zeroline: false, showline: true},
        margin: {
          l: 70,
          r: 50,
          b: 50,
          t: 50,
          pad: 0
        }
      }
    };
    //Call table to copy to RRS
   }

  data(event:ClipboardEvent) {
    let clipboardData = event.clipboardData;
    if (clipboardData){
    let pastedText = clipboardData.getData('text');
    let row_data = pastedText.split('\n');
    this.displayedColumns = row_data[0].split('\t');
    delete row_data[0];
    // Create table dataSource
    let data: any[] =[];

    row_data.forEach(row_data=>{
        let row:any={};
      this.displayedColumns.forEach((a:any, index:number)=>{row[a]= row_data.split('\t')[index]});
      data.push(row);
    })
    this.dataSource = data;
    console.log(this.dataSource)
    }
  }

}


