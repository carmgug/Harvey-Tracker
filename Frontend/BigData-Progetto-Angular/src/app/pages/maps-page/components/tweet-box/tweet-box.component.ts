import { animate, style, transition, trigger } from '@angular/animations';
import { DatePipe } from '@angular/common';
import { Component, Input } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { MapsService } from 'src/app/services/maps/maps.service';

@Component({
  selector: 'app-tweet-box',
  templateUrl: './tweet-box.component.html',
  styleUrls: ['./tweet-box.component.css'],
  animations: [
    trigger(
      'inOutAnimation', [
        transition(':enter', [
          style({transform: 'translateY(-100%)', opacity: 0}),
          animate('500ms', style({transform: 'translateY(0)', opacity: 1}))
        ])
      ]
    )
  ],

})
export class TweetBoxComponent {


  @Input() tweet:any;


  constructor(public sanitizer: DomSanitizer,public mapsService:MapsService) {
    console.log(this.tweet)
  }



  public getSafeUrl(url:string){
    console.log(url)
    console.log(this.sanitizer.bypassSecurityTrustResourceUrl(url))
    return this.sanitizer.bypassSecurityTrustResourceUrl(url)
  }

  public checkIfMp4(videoFeature:Record<string,string>[]):boolean{

    for(let dict of videoFeature){
      if(dict['content_type']=="video/mp4"){
        return true;
      }
    }
    return false

  }

  public getMp4(videoFeature:Record<string,string>[]){
    for(let dict of videoFeature){
      if(dict['content_type']=="video/mp4"){
        return dict['url']
      }
    }
    return " "
  }


  

}
