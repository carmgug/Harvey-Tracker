import { DatePipe } from '@angular/common';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ResponseMessage } from 'src/app/utilities/ResponseMessage';

@Injectable({
  providedIn: 'root'
})
export class UsersService {

  private UserUri="http://krhousegugcarm.ddns.net:8080";

  constructor(private http:HttpClient,private datePipe: DatePipe) { }



  public top10MostCommentedTweets(selected_topic: string){
    var format='/getMostTweetCommentato';
    format=this.addQueryParam(format,"selected_topic",selected_topic,true);
    return this.http.get<ResponseMessage<string[]>>(this.UserUri+format)
  }

  public getNUserWithMostOfTweet(n:number,selected_topics:string[]){
    var format='/getNUserWithMostOfTweet';
    var encodedTopics = encodeURIComponent(JSON.stringify(selected_topics));
    format=this.addQueryParam(format,"n",n,true)
    format=this.addQueryParam(format,"selectedCateogoriesOfTweets",encodedTopics,false)
    return this.http.get<ResponseMessage<string[]>>(this.UserUri+format)
    
  }

  public getDistributionOfTweetsByDay(timestamp_start:EpochTimeStamp,timestamp_end:EpochTimeStamp){
    var format='/getDistributionOfTweetsByDay'
    format=this.addQueryParam(format,"date_in",timestamp_start,true)
    format=this.addQueryParam(format,"date_fin",timestamp_end,false)
    return this.http.get<ResponseMessage<string[]>>(this.UserUri+format)
  }

  public getDistributionOfTop10HashtagByDay(timestamp_start:EpochTimeStamp,timestamp_end:EpochTimeStamp){
    var format='/getDistributionOfTop10HashtagByDay'
    format=this.addQueryParam(format,"timestamp_start",timestamp_start,true)
    format=this.addQueryParam(format,"timestamp_end",timestamp_end,false)
    return this.http.get<ResponseMessage<string[]>>(this.UserUri+format)
  }

  public getTopNWords(n:number,selected_topics:string[]){
    var format='/getTopNWordsByTopic'
    var encodedTopics = encodeURIComponent(JSON.stringify(selected_topics));
    format=this.addQueryParam(format,"n",n,true)
    format=this.addQueryParam(format,"selected_topics",encodedTopics,false)
    return this.http.get<ResponseMessage<string[]>>(this.UserUri+format)

  }

  public getFirstNHashtag(n:number,selected_topics:string[]){
    var format='/getFirstNHashtag'
    var encodedTopics = encodeURIComponent(JSON.stringify(selected_topics));
    format=this.addQueryParam(format,"n",n,true)
    format=this.addQueryParam(format,"selected_topics",encodedTopics,false)
    return this.http.get<ResponseMessage<string[]>>(this.UserUri+format)
  }
  public getFirstNMention(n:number,selected_topics:string[]){
    var format='/getFirstNMention'
    var encodedTopics = encodeURIComponent(JSON.stringify(selected_topics));
    format=this.addQueryParam(format,"n",n,true)
    format=this.addQueryParam(format,"selected_topics",encodedTopics,false)
    return this.http.get<ResponseMessage<string[]>>(this.UserUri+format)
  }

  public classifyByText(text:string){
    var format="/classifyByText"
    format=this.addQueryParam(format,"text",text,true);
    return this.http.get<ResponseMessage<string[]>>(this.UserUri+format)

  }

  private addQueryParam(format:String,Key:String,Value:any,first:boolean){
    var token="?";
    if (!first) {token="&"}
    return format+=token+Key+"="+Value
  }

  public transformDate(dateString:string){
    const date = new Date(dateString);
    const formattedDate = this.datePipe.transform(date, 'dd/MM/yyyy HH:mm:ss');
    return formattedDate

  }

}
