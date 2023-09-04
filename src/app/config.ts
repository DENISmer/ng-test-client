export const config = {
  "wpsUrls" : [
    "http://wps.esemc.nsc.ru:8080/geoserver/ows"
  ],
  "wpsVersion" : "1.0.0",
  xmlPayloadStart : `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
    <wps:Execute service="WPS" version="1.0.0"
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
              <wps:ComplexData mimeType="image/tiff" encoding="base64">`,
  xmlPayloadEnd : `</wps:ComplexData>
              </wps:Data>
            </wps:Input><wps:Input>
        <ows:Identifier>Minimum grid size</ows:Identifier>
        <wps:Data>
        <wps:LiteralData>18</wps:LiteralData>
        </wps:Data>
        </wps:Input><wps:Input>
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

  requestParams : {
    service : 'WPS',
    version : '1.0.0',
    request : { execute: 'Execute',getCapabilities: 'GetCapabilities', describeProcess: 'DescribeProcess'},
    identifier : 'default'
  },
}
export const configureExecuteBody = (base64Data: string, wpsParams: any, process: any, doubleValue: number, intValue: number): any => {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
  <wps:Execute service="WPS" version="1.0.0"
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
  ${base64Data}
  </wps:ComplexData>
  </wps:Data>
  </wps:Input><wps:Input>
        <ows:Identifier>Minimum grid size</ows:Identifier>
        <wps:Data>
        <wps:LiteralData>${intValue}</wps:LiteralData>
        </wps:Data>
        </wps:Input><wps:Input>
        <ows:Identifier>Dendrogram criteria</ows:Identifier>
        <wps:Data>
        <wps:LiteralData>${doubleValue}</wps:LiteralData>
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
        </wps:Execute>
  `
}
