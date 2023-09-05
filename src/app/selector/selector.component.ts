import {Component, OnInit} from '@angular/core';
import {DateService} from "../shared/date.service";
import axios from "axios";
import "tiff.js";
import '../shared/wps.requests'
import * as L from 'leaflet';
import {configureTheExecutePayload, describeProcess, getProcesses} from "../shared/wps.requests";
import {findTagByPath, findTagsByPath} from "xml-utils";
import GeoRasterLayer from "georaster-layer-for-leaflet";
// import * as GeoRasterLayer from "georaster-layer-for-leaflet";


declare function require(name:string): any;

@Component({
  selector: 'app-selector',
  templateUrl: './selector.component.html',
  styleUrls: ['./selector.component.scss']
})
// declare function require(name:string);
export class SelectorComponent implements OnInit{
  constructor(private dataService: DateService) {
    this.dataService.search$.subscribe(value => {
      console.log(value);
    })
    this.dataService.onFileInputChange$.subscribe(value => {
      // this.execute(this.url, value);
    })
  }

  fileByteArray: any = [];
  inputFile: any;
  base64File: any;
  base64ResultFile: any;
  dataInput: string = '';
  title: string = 'title';
  currentColor: number = 0;
  textAreaValue: any;
  url = 'http://wps.esemc.nsc.ru:8080/geoserver/ows';
  processes: any;
  setProcess = false;
  setConfiguration = false;
  describeProcessResult: any;
  describeProcessIsReady = false;
  fileIsReady = false;
  inputDouble: number = 0;
  inputInt: number = 0;

  map: any;

  private initMap(): void{
    this.map = L.map('map', {
      center: [39.8282, -98.5795 ],
      zoom: 3,
      maxBounds: [[-110, -170], [100, 300]]
    });

    const  tiles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      minZoom: 3,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    });
    tiles.addTo(this.map);
  }


  colors: string[] = [
    '#504343',
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
  cg = require('../config');

  ngOnInit(){
    this.initMap();
  }

  base64ToTif = (base64File: string) => {
    console.log("Base64ToTif: ",base64File);
    const parse_georaster = require('georaster');
    // const GeoRasterLayer = require("georaster-layer-for-leaflet");
    const binaryString = atob(base64File);

    let bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    console.log("BYTES BUFFER",bytes.buffer);
    parse_georaster(bytes.buffer).then((georaster: any) => {
      console.log("georaster:", georaster);
      const geolayer = new GeoRasterLayer({
        georaster: georaster,
        opacity: 0.7,
        // pixelValuesToColorFn: values => values[0] === 42 ? '#ffffff' : '#000000',
        resolution: 1024 // optional parameter for adjusting display resolution
      });
      this.map.fitBounds(geolayer.getBounds());
      console.log("BOUNDS: ", geolayer.getBounds());
      geolayer.addTo(this.map);
    });
  }

  execute = (): any => {
    if(this.base64File && this.describeProcessResult && this.processes && this.inputDouble && this.inputInt){
      const url = this.url;

      const xmlReadyPayload = configureTheExecutePayload(this.base64File, this.describeProcessResult,this.processes, this.inputDouble, this.inputInt)
      if(url && this.describeProcessResult){
        axios.post(`${url}`, xmlReadyPayload, this.configureRequest)
          .then(getXHRResponse => {
            console.log("AXIOS RESPONSE",getXHRResponse.data)
            let contextData: string = getXHRResponse.data.toString();
            return contextData
          })
          .then(response => {
            this.base64ResultFile = findTagByPath(response,['wps:ExecuteResponse','wps:ProcessOutputs','wps:Output','wps:Data','wps:ComplexData'])
            this.base64ToTif(this.base64ResultFile.inner)
          })
      }
      else alert(`WRONG DATA ${url}, ${xmlReadyPayload}`);
    }
    else {alert("ERROR")}
  }
  onInputDoubleChange(event: any) {
    this.inputDouble = event.target.value;
  }
  onInputIntChange(event: any) {
    this.inputInt = event.target.value;
  }

  onTextAreaChange = (event: any) => {
      // this.url = 'http://wps.esemc.nsc.ru:8080/geoserver/ows';
      this.dataInput = event;
      if(event) {
        console.log("INPUT DATA= ",this.dataInput)
      }
  }

  onGetCapabilities = async () => {
    await getProcesses(this.url,this.cg.config.requestParams)
      .then((response) => {
        this.processes = response;
        this.cg.config.requestParams.identifier = this.processes[0].value.identifier;
        this.setProcess = true;
      })
      .catch((e) => {console.log(e)})
  }

  onSetConfiguration = async () => {
    await describeProcess(this.url,this.cg.config.requestParams)
      .then((response) => {
        if(response){
          this.setConfiguration = true;
          this.describeProcessResult = response;
          console.log(this.describeProcessResult)
          response ? this.describeProcessIsReady = true : null;
        }
        else alert("something went wrong")
      })
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

    if(promise && this.processes){
      this.fileIsReady = true;
      this.base64File = await promise;
    }

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
