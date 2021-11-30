import { Component, OnInit } from '@angular/core';
import * as Papa from 'papaparse';
import { IShockGraph, IShockItem } from 'src/app/interfaces/IShockBuilder';

@Component({
  selector: 'shock-builder',
  templateUrl: './shock-builder.component.html',
  styleUrls: ['./shock-builder.component.css']
})
export class ShockBuilderComponent implements OnInit {
  displayedData:any[] = [];
  shockOptionsCopyDict:any = {};
  graph:IShockGraph = {
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
      xaxis: {title: 'Travel (in)', automargin: true, zeroline: false, showline: true, range: [0, 9]},
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
          this.plotData(returnedData);
        }
          });
    } else {
      alert('Problem loading CSV file');
    }
  }

  public async parseCSVFiletoXY(data:any[]){
    let indexStart:number = 0;
    let headerList:string[] = [];
    let dataDict:any = {};
    data.forEach((item:any, index:number) => {
      if (item[0] === 'Velocity'){
        indexStart = index + 2;
        for (let i = 1; i < item.length; i++){
          let header = item[i].substring(1);
          headerList.push(header); 
          dataDict[header] = {};
        }
      }
    });

    for (let i = indexStart; i <= data.length - 1; i++){
      data[i].forEach((element:string, index:number) => {
        if (index > 0){
          let key = headerList[ index - 1 ];
          let key2 = +data[i][0];
          dataDict[key][key2] = +element;
        } 
      });
    }
      // create list of objects with 3 distict choices CC / RC, CO / RC, CA / RA  [ { vel:   , CCRC:  , ect } ]
    let shockOptionsList:string[] = ['CC/RC', 'CO/RC', 'CA/RA'];
    let colorList:string[] = ['blue', 'red', 'green'];
    let shockOptionsDict:any = {};
    this.shockOptionsCopyDict = {};
    shockOptionsList.forEach((item:string) => {
      shockOptionsDict[item] = [];
      this.shockOptionsCopyDict[item] = [];
    });

    // add compression side of curves from 0 to 9 in/sec
    for ( let vel = 9 ; vel >= 0 ; vel-- ) {
      shockOptionsList.forEach((option:string) => {
        let compression:string = option.substring(0, 2)
        let force = dataDict[compression][vel]
        shockOptionsDict[option].push({vel: vel, force: force});
        this.shockOptionsCopyDict[option].push({vel: vel, force: force});
      })
    }

    // add rebound side of curves from 1 to 9 in/sec
    for ( let vel = 1 ; vel <= 9 ; vel++ ) {
      shockOptionsList.forEach((option:string) => {
        let rebound:string = option.substr(-2)
        let force:number = dataDict[rebound][vel]
        shockOptionsDict[option].push({vel: vel, force: force});
        this.shockOptionsCopyDict[option].push({vel: vel * -1, force: force});
      });
    }
    
    return { data: shockOptionsDict, shockOptionsList: shockOptionsList, colorList: colorList }
  }

  public plotData(returnedData:any){
    let plotDataList: any = [];
    let data = returnedData.data;
    let shockOptionsList = returnedData.shockOptionsList;
    let colorList = returnedData.colorList;
    for (let i = 0; i < shockOptionsList.length; i++){
      let shockType = data[shockOptionsList[i]];
      let xArray:number[] = [];
      let yArray:number[] = [];
      shockType.forEach((item:IShockItem) => {
        xArray.push(item.vel);
        yArray.push(item.force);
      });
      let plotObj:any = {
        x: xArray,
        y: yArray,
        type: 'scattergl',
        name: shockOptionsList[i],
        mode: 'lines + markers',
        marker: {
          color: colorList[i],
          size: 6
        },
        line: {
          color: colorList[i],
          width: 2
        }
      }
      plotDataList.push(plotObj)
    }; 
  
    this.graph = {
      data: plotDataList,
      layout: 
        {autosize: true, showlegend: true, legend: {x: .43, y: -.2, "orientation": "h"},
        title: 'Force vs Velocity',
        xaxis: {title: 'Velocity (in / sec)', automargin: true, zeroline: false, showline: true, range:[0, 9]},
        yaxis: {title: 'Force (lbf)', zeroline: false, showline: true},
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
