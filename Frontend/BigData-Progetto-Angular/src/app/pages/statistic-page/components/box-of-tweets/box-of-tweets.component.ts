import { Component, Input } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { trigger, state, style, animate, transition } from '@angular/animations';

@Component({
  selector: 'app-box-of-tweets',
  templateUrl: './box-of-tweets.component.html',
  styleUrls: ['./box-of-tweets.component.css'],
  animations: [
    trigger(
      'inOutAnimation', [
        transition(':enter', [
          style({transform: 'translateX(100%)', opacity: 0}),
          animate('500ms', style({transform: 'translateX(0)', opacity: 1}))
        ])
      ]
    )
  ]
})
export class BoxOfTweetsComponent {

  @Input() tweets: any[] | undefined;
  page:number=1

  constructor(public sanitizer: DomSanitizer) {}



  public nextPage(){
    console.log(this.page)
    this.page=this.page+1
  }

  public previousPage(){
    console.log(this.page)
    this.page=this.page-1
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
