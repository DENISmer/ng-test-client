import {Component} from '@angular/core';
import {DateService} from "../shared/date.service";
import axios from "axios";
import "tiff.js";
import '../shared/wps.requests'
import {describeProcess, getProcesses} from "../shared/wps.requests";
// declare function require(name:string): any;

declare function require(name:string): any;
// @ts-ignore
@Component({
  selector: 'app-selector',
  templateUrl: './selector.component.html',
  styleUrls: ['./selector.component.scss']
})
// declare function require(name:string);
export class SelectorComponent{
  constructor(private dataService: DateService) {
    this.dataService.search$.subscribe(value => {
      console.log(value);
    })
    this.dataService.onFileInputChange$.subscribe(value => {
      this.execute(this.url, value);
    })
  }

  fileByteArray: any = [];
  inputFile: any;
  imageUrl: string = "";
  dataInput: string = '';
  title: string = 'title';
  currentColor: number = 0;
  config: any = DateService.config;
  textAreaValue: any;
  url = 'http://wps.esemc.nsc.ru:8080/geoserver/ows';
  processes: any;
  setConfiguration = false;


  colors: string[] = [
    '#9f3535',
    '#fff',
    '#010101',
  ];

  configureRequest: any = {
    headers: {'Content-Type': 'text/xml'}
  };

  static requestParams : {
    service : 'WPS',
    version : '1.0.0',
    request : { execute: 'Execute',getCapabilities: 'GetCapabilities', DescribeProcess: ''}
    identifier : 'gs:CCA_'
  }
  cg = require('../config.js');

  execute = (url: string,data: any): any => {
    // console.log(data)

    if(url && data){
      axios.post(`${url}`, this.cg.config.xmlPayloadStart + data + this.cg.config.xmlPayloadEnd, this.configureRequest)
        .then(getXHRResponse => {
          console.log("AXIOS RESPONSE",getXHRResponse.data)
        })
    }
    else alert(`WRONG DATA ${url}, ${data}`);
  }

  onInputChange(event: any) {
    this.title = event.target.value;
  }
  onTextAreaChange = (event: any) => {
      // this.url = 'http://wps.esemc.nsc.ru:8080/geoserver/ows';
      this.dataInput = event;
      if(event) {
        console.log("INPUT DATA= ",this.dataInput)
        // this.dataService.imageData = event.target.value;
        //this.execute(this.url,this.dataInput);
      }
  }

  onGetCapabilities = async () => {
    await getProcesses(this.url,this.cg.config.requestParams)
      .then((response) => {
        this.processes = response;
        this.cg.config.requestParams.identifier = this.processes[0].value.identifier;
        // this.setConfiguration = true;
      })
      .catch((e) => {console.log(e)})
  }

  onSetConfiguration = async () => {
    await describeProcess(this.url,this.cg.config.requestParams);
  }

  onFileReady = async (file: any) => {
    console.log("onFileReady is worked")
    console.log(file)
    let fileByteArray = this.fileByteArray;

    let fileData = {
      fileName : '',
      content: ''
    }

    const promise = await new Promise((resolve,reject) => {
      const fr = new FileReader();
      fr.readAsArrayBuffer(file);
      fr.onload = ( e: any): any => {
        let arrayBuffer = e.target.result,
          array = new Uint8Array(arrayBuffer);
          for (let i = 0; i < array.length; i++) {
            fileByteArray.push(array[i]);
          }
          console.log("fileByteArray = ", fileByteArray)
          let binary = '';
          let bytes = new Uint8Array(fileByteArray);

          for (let i = 0; i < bytes.length; i++) {
            binary += String.fromCharCode( bytes[ i ] );
          }
        const data = fileData = {fileName: file.name, content: window.btoa(binary)}
        console.log(data)
        resolve(window.btoa(binary));
      }
    })

    this.execute(this.url, promise)
  }
  onFileInputChange = async (event: any) => {
    this.url = 'http://wps.esemc.nsc.ru:8080/geoserver/ows'
    console.log(event.target.files[0])
    if(event.target.value[0]){ await console.log(this.onFileReady(event.target.files[0])) }

  }

  onArrowClick(event: any,value: boolean){
    if(this.currentColor === 0 && !value){
      this.currentColor = 2
      this.dataService.setSearch("VALUE--")
    }
    else if(this.currentColor === 2 && value){
      this.currentColor = 0;
      this.dataService.setSearch("VALUE++")
    }
    else {
      value ? this.dataService.setSearch("VALUE++") : this.dataService.setSearch("VALUE--");
      value ? this.currentColor++ : this.currentColor--;
    }
  }

  setWPSservice(event: any,currentUrl: string){
    //axios.get({})
  }

}