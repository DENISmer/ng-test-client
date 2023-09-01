import axios from "axios";
import {getXHRResponse} from "rxjs/internal/ajax/getXHRResponse";
import {findTagByName, findTagByPath, findTagsByPath} from "xml-utils";

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

  function getDataFromDescribeProcess(outerXML: string){

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
      await axios.get(url,currentOptions)
        .then(response => {
          console.log(response);
        })
    }catch (e){
      console.log(e);
    }
}

