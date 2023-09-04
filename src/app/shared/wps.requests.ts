import axios from "axios";
import '../config.js'
import {findTagByName, findTagByPath, findTagsByPath} from "xml-utils";
import {configureExecuteBody} from "../config";

function getDataFromGetCapabilities(outerXML: string){
    let resultProcessContent: any = [];
    const keyOfProcess = findTagByName(outerXML,'ows:Title')?.inner;
    if(outerXML){
      resultProcessContent.push({
        key: keyOfProcess,
        value: {
          title: keyOfProcess,
          identifier: findTagByName(outerXML,'ows:Identifier')?.inner,
          abstract: findTagByName(outerXML,'ows:Abstract')?.inner
        }
      })
    }

    return resultProcessContent
  }

  async function getDataFromDescribeProcess(outerXML: string){
    let inputDataOuter = findTagsByPath(outerXML,['wps:ProcessDescriptions',"ProcessDescription","DataInputs",'Input']);
    let outputDataOuter = findTagsByPath(outerXML,['wps:ProcessDescriptions',"ProcessDescription","ProcessOutputs"]);
    let inputItems: any = [];
    let arrayOfOutputStringTypes: any[] = [];
    let result: any = {};
    const arrayOfOutputTypes = findTagsByPath(outputDataOuter[0].outer,['Output','ComplexOutput','Supported','Format']);

    // console.log(arrayOfOutputTypes)
    // console.log(promise)
    return new Promise((resolve, reject) => {
      for (let i = 0; i < inputDataOuter.length; i++) { //set Inputs Types array
        if (inputDataOuter[i].inner) {

          const inputItem: any = {
            identifier: findTagByName(inputDataOuter[i].outer, 'ows:Identifier')?.inner,
            title: findTagByName(inputDataOuter[i].outer, 'ows:Title')?.inner,
            complexData: {
              mimeType: findTagByPath(inputDataOuter[i].outer, ['ComplexData', 'Supported', 'Format', 'MimeType'])?.inner,
              encoding: findTagByPath(inputDataOuter[i].outer, ['ComplexData', 'Supported', 'Format', 'Encoding'])?.inner,
            },
            literalData: {
              dataType: findTagByPath(inputDataOuter[i].outer, ['LiteralData', 'DataType'])?.inner,
            }
          }
          inputItems.push(inputItem);
        }
      }

      for (let i: number = 0; i < arrayOfOutputTypes.length; i++) {
        arrayOfOutputStringTypes.push(findTagByName(arrayOfOutputTypes[i].outer, "MimeType")?.inner)
      }

      const outputItem: any = { //set outputs types
        identifier: findTagByPath(outputDataOuter[0].outer, ['Output', 'ows:Identifier'])?.inner,
        title: findTagByPath(outputDataOuter[0].outer, ['Output', 'ows:Title'])?.inner,
        complexOutput: {
          mimeType: arrayOfOutputStringTypes,
        }
      }

      result = {//creating describe process result data
        input: inputItems,
        output: outputItem
      }
      resolve(result);
    })
  }

  export  async function getProcesses(wpsUrl: string,params: any) {
    const currentOptions = {
      headers:{
        "Content-type": "text/xml",
      },
      params:{
        'service': params.service,
        'version': params.version,
        'request': params.request.getCapabilities,
      }
    }

    let resultListOfProcesses: string;
    let result;

    try{
      await axios.get(wpsUrl,currentOptions)
        .then(response => {
          resultListOfProcesses = findTagsByPath(response.data,[ 'wps:Capabilities','wps:ProcessOfferings','wps:Process'])[105].outer;
          // console.log(getDataFromXml(resultListOfProcesses));
          result = getDataFromGetCapabilities(resultListOfProcesses);
        })
        .catch(e => {
          console.warn("getProcesses error",e)
          return false
        })
    }
    catch {(e: any) => alert(e)}

    return await result;
}

export async function describeProcess(url: string,params: any){
  let result;

  const currentOptions = {
    headers:{
      "Content-type": "text/xml",
    },
    params:{
      'service': params.service,
      'version': params.version,
      'request': params.request.describeProcess,
      'identifier' : params.identifier
    }
  }

    try {
    console.log('describe process start')
      await axios.get(url,currentOptions)
        .then(response => {
          result = getDataFromDescribeProcess(response.data)
          // return getDataFromDescribeProcess(response.data)
        })
    }catch (e){
      console.log(e);
    }
    finally {
      console.log("describe process end")
    }
    return await result;
}

export function configureTheExecutePayload(base64Data: string, wpsParams: any, process: any){
  // let xmlExecutePayload: string = '';
  const xmlExecuteBody = configureExecuteBody(base64Data, wpsParams, process)

  // return xmlExecutePayload;
}

