import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { data } from 'jquery';
import * as Papa from 'papaparse';


import {partsDefList} from '../../external-data/part-definition-list'
import {inputDisplayNames} from '../../external-data/batch-parameter-mapping'

@Component({
  selector: 'app-submit-dialog',
  templateUrl: './submit-dialog.component.html',
  styleUrls: ['./submit-dialog.component.css']
})
export class SubmitDialogComponent implements OnInit {

  uniqueValueList: any;
  newChannelsDict:any = [];
  i:number = 0;
  j:number = 0;
  submitEnabled:boolean = true;

  constructor( public dialogRef: MatDialogRef<SubmitDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) {
    this.uniqueValueList = this.data.uniqueValueList;
    this.newChannelsDict = this.data.newChannelsDict;
  }

  ngOnInit(): void {
    
  }

  onSubmit(){
  let returnData:any[] = [];
    Object.values(this.newChannelsDict).forEach((object:any) => {
      returnData.push(object);  
    });
    this.dialogRef.close({data: returnData});
  }

  onCancel(): void {
    this.dialogRef.close({data: null});
  }

  onclick(i:any, j:any){
    this.i = i;
    this.j = j;
  }

public addCSVData(files: any) {
    this.uniqueValueList[this.i].isLoaded[this.j] = true;
    let file = files.target.files[0]
    if (file) {
      Papa.parse(file, {
        header: false,
        skipEmptyLines: true,
        complete: (result) => {
          let csvdata = result.data;
          let csvDict: any = {};
          csvdata.forEach((item:any) => {
            let key:any = item[0];
            csvDict[key] = item[1];
          })
          this.addPartData(csvDict, this.j, this.i)
          }
        });
    } else {
      alert('Problem loading CSV file');
    }
    
  }

  setEnabled(){
    let enabledList: any[] = [];
    this.uniqueValueList.forEach((element:any) => {
      element.isLoaded.forEach((value:any) => {
        if (value === true) {
          let pass = 'pass';
        } else {
          enabledList.push(value);
        }
      });
    });
    if (enabledList.length === 0) {
      this.submitEnabled = false;
    }
  }

  addPartData(csvDict:any, j:number, i:number) {
    let origChannel = this.uniqueValueList[i].channel;
    let channelList = partsDefList[origChannel].channels;
    channelList.forEach((displayChannel:any) => {
      let paramMapObj = inputDisplayNames[displayChannel];
      let value = csvDict[paramMapObj.WorkflowName];
      let scaleValue = (+value * +paramMapObj.Scale).toFixed(3).toString();
      let baseValues = this.newChannelsDict[displayChannel].values;
      let testValue = this.uniqueValueList[i].values[j];
      let updatedValues: string[] = [];
      baseValues.forEach((value:any) => {
        if (value == testValue) {
          updatedValues.push(scaleValue);
        } else {
          updatedValues.push(value);
        }
        
        });
      this.newChannelsDict[displayChannel].values = updatedValues;
      });
    this.setEnabled();
  }
}
