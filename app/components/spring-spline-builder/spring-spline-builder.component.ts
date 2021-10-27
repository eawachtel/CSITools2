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
  selector: 'spring-spline-builder',
  templateUrl: './spring-spline-builder.component.html',
  styleUrls: ['./spring-spline-builder.component.css']
})
export class SpringSplineBuilderComponent implements OnInit {
  
  lfTrimStart:number = 0;
  rfTrimStart:number = 0;
  splineStart:number = 0;
  splineEnd:number = 0;
  springSplineType:string = 'single';
  springCutStart:number = 0;
  springCutEnd:number = 0;
  fullSpringCopy:IxyGraph[] = [];
  pigtailSpringCopy:IxyGraph[] = [];
  engagedSpringCopy:IxyGraph[] = [];
  pasteBoxString:string = 'Click box and Paste Ride Rate Data Here'
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

  pastedSpringData:IxyGraph[] = [];

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
    if (offset <= 0){return}
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
  
  public fitBotData(data:IxyGraph[], trimStartVar:number){
    const regression = require('regression');
    let polyFitData: number[][] = [];
    let fitData: IxyGraph[] = [];
    //Define start of trim if defined
    let trimStart:number = 0;
    if (trimStartVar > 0) {trimStart = trimStartVar}
    //find value greater that 1in shock travel and get index
    for (let i = 0; i < data.length; i++){
      if (data[i].x > trimStart) { polyFitData.push([data[i].x, data[i].y]) }; 
      if (data[i].x > 1) { break };
    }
    const result = regression.polynomial(polyFitData, { order: 2 });
    //always add zero to the returned data
    let predictVals:number[] = result.predict(0);
    fitData.push({x: predictVals[0], y:predictVals[1]})
    // if the trim value is greater than .05 add more points in the returned data
    let count:number = .05;
    for (let i = 0 ; i < 100 ; i++) {
      if (count < trimStartVar) {
        let predictObj:number[] = result.predict(count);
        fitData.push({x: predictObj[0], y:predictObj[1]});
        count = count + .05;
      }
    }

    return { fitData, predictVals, trimStart }
  }
  
  public offset(data:IxyGraph[], setupWeight:number, side:string, trimStartVar:number, fitObj:{fitData: IxyGraph[], predictVals:number[]}){
    
    let offsetFactor:number;
    let trimStart:number = -.1;
    if (trimStartVar > 0) {trimStart = trimStartVar}
    let predictedY:number = fitObj.predictVals[1]
    if (setupWeight === 0){offsetFactor = 0} else {offsetFactor = setupWeight - predictedY;}
    switch(side){
      case 'LF':
        this.lfOffsetFactor = offsetFactor;
        break
      case 'RF':
        this.rfOffsetFactor = offsetFactor;
        break
    }
    let offsetData: IxyGraph[] = [];
    let x:number;
    let y:number;
    data.forEach((item:IxyGraph) => {
      if (item.x > trimStart) {
        x = item.x;
        y = item.y  + offsetFactor;
        offsetData.push({x: x, y: y})
      }
    });
    for (let i = fitObj.fitData.length - 1; i >= 0 ; i--){
      offsetData.unshift( { x: fitObj.fitData[i].x, y: fitObj.fitData[i].y + offsetFactor} )
    }
    return offsetData
  }

  public onBottomCurveSelect(side:string) {
    if (side === 'LF') {
      this.lfCurveSelect = 'bottom';
      if (this.rfCurveSelect === 'copied') {
        this.rfCurveSelect = 'full';
        this.plotRFPulldownData(this.rfFullPersist);
      } else {
        let fitObj:{fitData:IxyGraph[], predictVals:number[]} = this.fitBotData(this.lfBottomPersist, this.lfTrimStart)
        this.lfBottomMod = this.offset(this.lfBottomPersist, this.lfOffsetValue, side, this.lfTrimStart, fitObj);
      } 
    this.plotLFPulldownData(this.lfBottomMod);
    }
    if (side === 'RF') {
      this.rfCurveSelect = 'bottom';
      if (this.lfCurveSelect === 'copied') {
        this.lfCurveSelect = 'full';
        this.plotLFPulldownData(this.lfFullPersist);
      } else {
        let fitObj:{fitData:IxyGraph[], predictVals:number[]} = this.fitBotData(this.rfBottomPersist, this.rfTrimStart)
        this.rfBottomMod = this.offset(this.rfBottomPersist, this.rfOffsetValue, side, this.rfTrimStart, fitObj);
      } 
    }
    this.plotRFPulldownData(this.rfBottomMod);
    
  }

  public onTopCurveSelect(side:string) {
    if (side === 'LF') {
      this.lfCurveSelect = 'top';
      if (this.rfCurveSelect === 'copied') {
        this.rfCurveSelect = 'full';
        this.plotRFPulldownData(this.rfFullPersist);
      } else {
        let fitObj:{fitData:IxyGraph[], predictVals:number[]} = this.fitBotData(this.lfTopPersist, this.lfTrimStart)
        this.lfTopMod = this.offset(this.lfTopPersist, this.lfOffsetValue, side, this.lfTrimStart, fitObj);
      }
      this.plotLFPulldownData(this.lfTopMod);
    }
    if (side === 'RF') {
      this.rfCurveSelect = 'top';
      if (this.lfCurveSelect === 'copied') {
        this.lfCurveSelect = 'full';
        this.plotLFPulldownData(this.lfFullPersist);
      } else {
        let fitObj:{fitData:IxyGraph[], predictVals:number[]} = this.fitBotData(this.rfTopPersist, this.rfTrimStart)
        this.rfTopMod = this.offset(this.rfTopPersist, this.rfOffsetValue, side, this.rfTrimStart, fitObj);
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
    }
    if (this.lfCurveSelect !== 'full'){
      let lfx:number[] = [];
      let lfy:number[] = [];
      plotData.forEach((item:IxyGraph) => {
        if (item.x !== undefined || item.y !== undefined) {
          lfx.push(item.x);
          lfy.push(item.y);
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
          mode: 'markers',
          marker: {
            color: 'blue',
            size: 3
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
  
  public solveLFIndexedBottomData(length:number, data:IxyGraph[]){
    let indexedLongData:any[]=[];
    let count:number;
    
    /// Data points from mod dataset to 1 are used for the beginning of the curve
    for (let i = 0; i <= data.length - 1; i++) {
      if (data[i].x >= 1) { break };
        indexedLongData.push(data[i]);
    }
    
    count = indexedLongData.length -1;
    /// Data points from persisted data set  after 1" with offset applied to y
    for (let i = this.lfFullPersist.length - 1; i >= 0; i--) {
      if (this.lfFullPersist[i].x > 1 && count <= length){
        let obj:IxyGraph = {x: this.lfFullPersist[i].x, y: this.lfFullPersist[i].y + this.lfOffsetFactor};
        indexedLongData.push(obj);
        count = count + 1;
      }
    }

    return indexedLongData;
  }

  public solveLFIndexedTopData(length:number, data:IxyGraph[]){
    let indexedLongData:any[]=[];
    let count:number;
    
    /// Data points from mod dataset to 1 are used for the beginning of the curve
    for (let i = 0; i <= data.length - 1; i++) {
      if (data[i].x >= 1 ) { break };
      indexedLongData.push(data[i]);
    }

    count = indexedLongData.length -1;
    /// Data points from persisted data set  after 1" with offset applied to y
    for (let i = 0; i <= this.lfFullPersist.length - 1; i++) {
      if (this.lfFullPersist[i].x > 1 && count <= length){
        let obj:IxyGraph = {x: this.lfFullPersist[i].x, y: this.lfFullPersist[i].y + this.lfOffsetFactor};
        indexedLongData.push(obj);
        count = count + 1;
      }
    }

    return indexedLongData;
  }

  public solveRFIndexedBottomData(length:number, data:IxyGraph[]){
    let indexedLongData:any[]=[];
    let count:number;
    
    /// Data points from mod dataset to 1 are used for the beginning of the curve
    for (let i = 0; i <= data.length - 1; i++) {
      if (data[i].x >= 1) { break };
        indexedLongData.push(data[i]);
    }
    
    count = indexedLongData.length -1;
    /// Data points from persisted data set  after 1" with offset applied to y
    for (let i = this.rfFullPersist.length - 1; i >= 0; i--) {
      if (this.rfFullPersist[i].x > 1 && count <= length){
        let obj:IxyGraph = {x: this.rfFullPersist[i].x, y: this.rfFullPersist[i].y + this.rfOffsetFactor};
        indexedLongData.push(obj);
        count = count + 1;
      }
    }

    return indexedLongData;
  }

  public solveRFIndexedTopData(length:number, data:IxyGraph[]){
    let indexedLongData:any[]=[];
    let count:number;

    /// Data points from mod dataset to 1 are used for the beginning of the curve
    for (let i = 0; i <= data.length - 1; i++) {
      if (data[i].x >= 1 ) { break };
      indexedLongData.push(data[i]);
    }

    count = indexedLongData.length -1;
    /// Data points from persisted data set  after 1" with offset applied to y
    for (let i = 0; i <= this.rfFullPersist.length - 1; i++) {
      if (this.rfFullPersist[i].x > 1 && count <= length){
        let obj:IxyGraph = {x: this.rfFullPersist[i].x, y: this.rfFullPersist[i].y + this.rfOffsetFactor};
        indexedLongData.push(obj);
        count = count + 1;
      }
    }

    return indexedLongData;
  }

  public async copyRSSDataToClip(){
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
          indexedLongData = this.solveRFIndexedBottomData(lfData.length, rfData);
          break;
        case 'top':
          indexedLongData = this.solveRFIndexedTopData(lfData.length, rfData);
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
          indexedLongData = this.solveLFIndexedBottomData(rfData.length, lfData);
          break;
        case 'top':
          indexedLongData = this.solveLFIndexedTopData(rfData.length, lfData);
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
    let test = plotData
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
        mode: 'markers',
        marker: {
          color: 'blue',
          size: 3
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
          rfx.push(item.x);
          rfy.push(item.y);
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
        mode: 'markers',
        marker: {
          color: 'blue',
          size: 3
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

  public pasteData(event:ClipboardEvent) {
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
    this.pastedSpringData = numberData1;
    this.pasteBoxString = 'Data Pasted'
    }
    this.plotSpringSplineData();
  }

  public clearSpringSplineData(){
    this.pasteBoxString = 'Click box and Paste Ride Rate Data Here'
    this.pastedSpringData = [];
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
    this.pastedSpringData.forEach((item:IxyGraph, index:number) => {
      if (item.x >= this.splineStart && item.x <= this.splineEnd){
        finalCopy.push(item);
      }
    });
    
    this.fullSpringCopy = await this.checkAscendingValues(finalCopy);
    let string = '';
    this.fullSpringCopy.forEach((item) => {
      let subString = item.x.toString() + '\t' + item.y.toString() + '\r';
      string = string + subString;
    });
    this.clipboard.copy(string);
    this.plotSpringSplineData();
  }

  public onLFTrimStart(event:any){
    this.lfTrimStart= +event.target.value;
    switch(this.lfCurveSelect){
        case 'top':
          this.onTopCurveSelect('LF')
          break
        case 'bottom':
          this.onBottomCurveSelect('LF')
          break
        case 'copied':
          this.lfCurveSelect = 'full'
          this.plotLFPulldownData(this.lfFullPersist);
    }
  }

  public onRFTrimStart(event:any){
    this.rfTrimStart= +event.target.value;
    switch(this.rfCurveSelect){
      case 'top':
        this.onTopCurveSelect('RF')
        break
      case 'bottom':
        this.onBottomCurveSelect('RF')
        break
      case 'copied':
        this.rfCurveSelect = 'full'
        this.plotRFPulldownData(this.rfFullPersist);
    }
  }

  public onSplineStart(event:any){
    let cut = +event.target.value;
    this.springCutStart = cut;
  }

  public onSplineEnd(event:any){
    let cut = +event.target.value;
    this.springCutEnd = cut;
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
    this.pastedSpringData.forEach((item:IxyGraph) => {
      if (item.x !== undefined || item.y !== undefined) {
        springXPersist.push(item.x);
        springYPersist.push(item.y);
      }
    });
    springXMin = Math.min(...springXPersist) - .1;
    springXMax = Math.max(...springXPersist) + .1;
    
    let dataList:IplotlySplineGraph[] = []
    if (this.fullSpringCopy.length < 1 && this.springSplineType === 'single'){
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
    }

    if (this.fullSpringCopy.length > 0 && this.springSplineType === 'single'){
      let x: number[] = [];
      let y: number[] = [];
      this.fullSpringCopy.forEach((item:IxyGraph) => {
        x.push(item.x);
        y.push(item.y)
      })
      dataList = [ 
        // {
        //   x: springXPersist,
        //   y: springYPersist,
        //   type: 'scattergl',
        //   name: 'Spring Spline Data',
        //   mode: 'lines+markers',
        //   marker: {
        //     color: 'blue',
        //     size: 5
        //   },
        //   line: {
        //     dash: 'solid',
        //     color: 'blue',
        //     width: 3
        //   }
        // },
        {
          x: x,
          y: y,
          type: 'scattergl',
          name: 'Copied Spring Spline Data',
          mode: 'lines+markers',
          marker: {
            color: 'black',
            size: 3
          },
          line: {
            dash: 'solid',
            color: 'black',
            width: 1
          }
        }
      ]
    }
      
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
    //Call table to copy to RRS
  }
}


