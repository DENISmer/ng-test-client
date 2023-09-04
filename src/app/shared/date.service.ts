import {Injectable} from "@angular/core";
import * as moment from "moment";
import {BehaviorSubject, Subject} from "rxjs";
@Injectable({
  providedIn: 'root'
})
export class DateService {
  public date: BehaviorSubject<moment.Moment> = new BehaviorSubject(moment())

  private searchSource = new Subject<any>();
  private onFileInputChangeSource = new Subject<any>()

  onFileInputChange$ = this.onFileInputChangeSource.asObservable();
  search$ = this.searchSource.asObservable();




  static config: any = {
    "wpsUrls": [
      "http://wps.esemc.nsc.ru:8080/geoserver/ows",
      "undef",
      "undef",
    ],
    "wpsVersion": "1.0.0"
  }
  public static requestParams : {
    service : 'WPS',
    version : '1.0.0',
    request : { execute: 'Execute',getCapabilities: 'GetCapabilities', DescribeProcess: ''}
    identifier : 'gs:CCA_'
  }
  public static imageData = '';

  static xmlBody: any = {
    dataStart : `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
    <wps:Execute service="WPS" version="1.0.0"' +
        xmlns:wps="http://www.opengis.net/wps/1.0.0"
        xmlns:ows="http://www.opengis.net/ows/1.1"
        xmlns:xlink="http://www.w3.org/1999/xlink"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.opengis.net/wps/1.0.0
        http://schemas.opengis.net/wps/1.0.0/wpsExecute_request.xsd">
        <ows:Identifier>gs:CCA_</ows:Identifier>
          <wps:DataInputs>

            <wps:Input>
              <ows:Identifier>Raster</ows:Identifier>
              <wps:Data>
              <wps:ComplexData mimeType="image/tiff" encoding="base64">
              ${DateService.imageData}
              </wps:ComplexData>
              </wps:Data>
            </wps:Input>

            <wps:Input>
              <ows:Identifier>Minimum grid size</ows:Identifier>
              <wps:Data>
              <wps:LiteralData>18</wps:LiteralData>
              </wps:Data>
            </wps:Input>

            <wps:Input>
              <ows:Identifier>Dendrogram criteria</ows:Identifier>
              <wps:Data>
              <wps:LiteralData>0.5</wps:LiteralData>
              </wps:Data>
            </wps:Input>

          </wps:DataInputs>
        <wps:ResponseForm>
        <wps:ResponseDocument storeExecuteResponse="false" lineage="false" status="false">
        <wps:Output asReference="false" mimeType="image/tiff">
        <ows:Identifier>result</ows:Identifier>
        </wps:Output>
        </wps:ResponseDocument>
        </wps:ResponseForm>
        </wps:Execute>`,
        config : {
          "headers":{
            "Content-type": "text/xml",
          },
          // "params":{
          //   'service': DateService.requestParams.service,
          //   'version': DateService.requestParams.version,
          //   'request': DateService.requestParams.request,
          //   'identifier': DateService.requestParams.identifier,
          // },
        }
  }

  setSearch = (value: string) => {
    this.searchSource.next(value)
  }
  setOnInputFileChange = (url: string, data: string) => {
    this.onFileInputChangeSource.next(data)
  }
}
