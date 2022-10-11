import { HttpUrlEncodingCodec, HttpParameterCodec } from '@angular/common/http';


export class MyCustomHttpUrlEncodingCodec extends HttpUrlEncodingCodec {
  encodeKey(k: string): string {
      return super.encodeKey(k)
          .replace(new RegExp("%5B", "g"), "[")
          .replace(new RegExp("%5D", "g"), "]");
  }
}

export class CustomHttpParamEncoder implements HttpParameterCodec {
  encodeKey(key: string): string {
    return encodeURIComponent(key);
  }
  encodeValue(value: string): string {
      console.log();
    return encodeURIComponent(value);
  }
  decodeKey(key: string): string {
    return decodeURIComponent(key);
  }
  decodeValue(value: string): string {
    return decodeURIComponent(value);
  }
}