export interface ResponseMessage<T> {
    message:String;
    timestamp:EpochTimeStamp;
    data:T;
  
}
  