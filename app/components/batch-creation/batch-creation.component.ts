import { Component, OnInit, Inject } from '@angular/core';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { Clipboard } from '@angular/cdk/clipboard';
import { SubmitDialogComponent } from '../submit-dialog/submit-dialog.component';
import * as _ from 'lodash';
import * as Papa from 'papaparse';
import { ExportToCsv } from 'export-to-csv';
import { cloneDeep } from 'lodash';

import {partsDefList} from '../../external-data/part-definition-list'

// const batchMatrix2 = [
//   {attribute: 'test', baselineValue: null, values: '150, 200'}
// ]



@Component({
  selector: 'batch-creation',
  templateUrl: './batch-creation.component.html',
  styleUrls: ['./batch-creation.component.css']
})


export class BatchCreationComponent implements OnInit {
  // animal: string | undefined;
  // name: string | undefined;
  batchMatrix: any[] = [];
  batchDict: any = {};
  batchType:string = 'desktop';
  designMatrix: any[] = [];
  excludedKeyStrings: string[] = ['', 'Response 1']
  excludedValueStrings: string[] = ['Run', 'R1']
  exportIsDisabled:boolean = true;
  inputs: string[] = [];
  inputFactorList: string[] = [];
  inputDict: any = {};
  functionInputFactors: any[] = ['JackscrewAdjustLR', 'JackscrewAdjustRR'];
  dialogInputFactors: string[] = ['LFFARBArm', 'RFFARBArm', 'LFUCASlugs', 'RFUCASlugs', 'LFUCA', 'RFUCA']
  displayedColumns: string[] = ['attribute', 'values'];
  // dataSource = batchMatrix2

  constructor(public dialog: MatDialog, private clipboard: Clipboard) { 
    
  }

  ngOnInit(): void {
  }

 
  public async processInputs(data:any[]) {
    let factorObj = data[0];
    this.inputFactorList = [];
    //make dictionar of Factor Labels ie {Factor1:'LRSpring'}
    Object.keys(factorObj).forEach((val:any) => {
      if (!this.excludedKeyStrings.includes(val)) {
        this.inputDict[val] = factorObj[val].substring(2);
        this.inputFactorList.push(factorObj[val].substring(2));
      }
    });
    // add attributes to the batch matrix
    Object.values(factorObj).forEach((val:any) => {
      if (!this.excludedValueStrings.includes(val)) {
        this.inputs.push(val.substring(2));
      };
    });
    this.inputs.forEach((item) => {
      let batchMatrixObj = {
        attribute: item,
        baselineValue: null,
        values: [],
        unit: null
      }
      this.batchDict[item] = (batchMatrixObj);
    });
  }
    
  public async processValues(data:any[]) {
    let designMatrix = data.slice(2)
    // delete Run and Response column from design matrix
    designMatrix.forEach((element) => {
      delete element[''];
      delete element['Response 1']
    });
    
    //loop through design matrix and assign values to the batchDict
    designMatrix.forEach((element) => {
      Object.keys(element).forEach((designKey:any) => {
        let value = element[designKey];
        let inputKey = this.inputDict[designKey];
        this.batchDict[inputKey]['values'].push(value)
      });
    });
  }

  dialogValues(){
    let test = this.batchDict;
    let commonValsList: any[] = [];
    //find common values in dialogInputFactors and create list of object that has initial 1,2,3 ect values in them
    let commonVals = _.intersection(this.dialogInputFactors, this.inputFactorList)
    if (commonVals.length > 0){
      commonVals.forEach((item) => {
        commonValsList.push(
          {
            channel: item,
            values: this.batchDict[item].values
          }
        )
      });
    
    // Get distinct values from each parameter requiring a part file
      let uniqueValueList: any = [];
      commonValsList.forEach((item) => {
        let uniqueVals:any = [...new Set(item.values)].sort();
        let isLoadedList:boolean[] = [];
        uniqueVals.forEach((value:any) =>{
          isLoadedList.push(false)
        });
        uniqueValueList.push(
          {
            channel:item.channel,
            values: uniqueVals,
            isLoaded: isLoadedList
          }
        )
      });

      // get new channels for required parts with original 1,2,3 values
      let newChannelsDict:any = {}
      commonValsList.forEach((element: { channel: string, values: string[] }) => {
        let newChannels = partsDefList[element.channel].channels;
        newChannels.forEach((channel: any) => {
          newChannelsDict[channel] = 
            {
              attribute: channel,
              baselineValue: null,
              values: element.values,
              unit: null}
            }
          )
        });
      this.openDialog(uniqueValueList, newChannelsDict)
    }

    //Test and write all values not in commonVals
    Object.keys(this.batchDict).forEach((key:any) => {
      if (!this.dialogInputFactors.includes(key)) {
        this.batchMatrix.push(this.batchDict[key])
      } 
    });

    if (commonVals.length === 0 && this.batchMatrix.length > 0){
      this.setStringValues();
    }
  }

  setStringValues(){
    this.batchMatrix.forEach((item) => {
      let values = item.values;
      let string = ''
      values.forEach((value:any, index:number) => {
        if (index === 0){
          string = string + value.toString();
        } else {
          string = string + ', ' + value.toString();
        }
      });
      item.values = string;
    })
    this.batchMatrix = cloneDeep(this.batchMatrix);
    if (this.batchMatrix.length > 0) {
      this.exportIsDisabled = false;
    }
  }

  openDialog(uniqueValueList: any, newChannelsDict: any ): void {
    
    const dialogRef = this.dialog.open(SubmitDialogComponent, {
      width: '600px',
      data: {uniqueValueList: uniqueValueList, 
          newChannelsDict: newChannelsDict
        }
      });

    dialogRef.afterClosed().subscribe(result => {
      if (result === undefined) {
        alert('Dialog Closed No Files Loaded')
      } else {
        let returnData = result.data;
        returnData.forEach((item:any[]) => {
          this.batchMatrix.push(item)
        })
      }
      this.setStringValues();
    });
  }

  public async processFunctions() {
      Object.keys(this.batchDict).forEach((batchKey:any) => {
        if (this.functionInputFactors.includes(batchKey)) {
          switch(batchKey) {
            case 'JackscrewAdjustLR':
              this.batchDict[batchKey]['values'] = this.jackscrewScale(this.batchDict[batchKey]['values']);
              break;
            case 'JackscrewAdjustRR':
              this.batchDict[batchKey]['values'] = this.jackscrewScale(this.batchDict[batchKey]['values']);
              break;
          }
        }
      })
  }

  public jackscrewScale(values: any[]) {
    let newValues: any[] = []
    values.forEach((number) => {
      let newNumber = ((number / 12) * -1).toFixed(3);
      newValues.push(newNumber);
    });

    return newValues
  }


  public  fileChangeListener(files: any) {
    let file = files.target.files[0];
    if (file) {
        this.batchMatrix = [];
        this.inputs = [];
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: async (result) => {
          
          await this.processInputs(result.data); // get input factors in a list and add to batchmatrix as row
          await this.processValues(result.data); // get values and enter into array in batchmatrix
          await this.processFunctions(); // run functions on channels requiring addition channel defs ie. FARB ARMS, Jackscrew ect
          let test = this.batchDict;
          this.dialogValues(); // Dialog to get needed parts definitions
        }
          });
    
      
      
    } else {
      alert('Problem loading CSV file');
    }
  }

  exportBatchMatrix(){
    const options = { 
      fieldSeparator: ',',
      filename: 'PM Batch Matrix',
      quoteStrings: '"',
      decimalSeparator: '.',
      showLabels: false, 
      showTitle: false,
      title: 'My Awesome CSV',
      useTextFile: false,
      useBom: true,
      useKeysAsHeaders: true,
      // headers: ['Column 1', 'Column 2', etc...] <-- Won't work with useKeysAsHeaders present!
    };
   
  const csvExporter = new ExportToCsv(options);
   
  csvExporter.generateCsv(this.batchMatrix);

  }

  copyToClipBoard() {
    let batchMatrix = this.batchMatrix;
    let string = '';
    batchMatrix.forEach((item) => {
      let subString = item.attribute.toString() + '\t' + ' ' + '\t' + item.values + '\r';
      string = string + subString;
    });
    this.clipboard.copy(string);
  }

  public radialClick(){

    setTimeout(() => {
      
    }, 100);

  }
}

