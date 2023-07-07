import { DatePipe } from '@angular/common';
import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {MarkerMap} from 'src/app/utilities/Markermap';
import {ResponseMessage} from 'src/app/utilities/ResponseMessage';

@Injectable({
  providedIn: 'root',
})
export class MapsService {
  private MapsUri = "http://krhousegugcarm.ddns.net:8080";


  constructor(private http: HttpClient,private datePipe: DatePipe) {
  }

  public transformDate(dateString:string){
    const date = new Date(dateString);
    const formattedDate = this.datePipe.transform(date, 'dd/MM/yyyy HH:mm:ss');
    return formattedDate ? formattedDate : "Incompatible Date Formats"

  }


  public getGeoByDateAndTopic(date_in: EpochTimeStamp, date_fin: EpochTimeStamp, topic: String) {
    var format = "/getGeoByDateAndTopic";
    format = this.addQueryParam(format, "date_in", date_in, true);
    format = this.addQueryParam(format, "date_fin", date_fin, false);
    format = this.addQueryParam(format, "topic", topic, false);
    return this.http.get<ResponseMessage<string[]>>(this.MapsUri + format);
  }

  public getTweetByTweetID(TweetID: number){
    var format= "/getTweetByTweetID";
    format=this.addQueryParam(format,"TweetID",TweetID,true)
    return this.http.get<ResponseMessage<string[]>>(this.MapsUri+format);
  }

  public getAllGEOAndTweetIDNearestP(lat:number,lng:number,r:number){
    var format="/getAllGEOAndTweetIDNearestP";
    format=this.addQueryParam(format,"latitude",lat,true);
    format=this.addQueryParam(format,"longitude",lng,false);
    format=this.addQueryParam(format,"r",r,false);
    return this.http.get<ResponseMessage<string[]>>(this.MapsUri+format);
  }

  private addQueryParam(format: String, Key: String, Value: any, first: boolean) {
    var token = "?";
    if (!first) {
      token = "&"
    }
    return format += token + Key + "=" + Value
  }


}
