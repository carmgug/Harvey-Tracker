import {HttpErrorResponse} from '@angular/common/http';
import {AfterContentChecked, AfterViewInit, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {UsersService} from 'src/app/services/users/users.service';
import {Tweet} from 'src/app/utilities/Tweet';
import {elements} from "chart.js";
import flatpickr from 'flatpickr';

@Component({
  selector: 'app-statistic-page',
  templateUrl: './statistic-page.component.html',
  styleUrls: ['./statistic-page.component.css']
})
export class StatisticPageComponent {




  availableTopicOfTweets = ["All", "relevant_information", "injured_or_dead_people",
    "caution_and_advice", "displaced_and_evacuations", "sympathy_and_support",
    "response_efforts", "infrastructure_and_utilities_damage", "personal",
    "affected_individual", "not_related_or_irrelevant", "missing_and_found_people",
    "donation_and_volunteering"]

  availableQueries = ["top10MostCommentedTweets", "getNUserWithMostOfTweet","getDistributionOfTweetsByDay","getDistributionOfTop10HashtagByDay","getFirstNWordsORNMentionORNHashtag"]

  translateQueries:Record<string,string>= {
    "top10MostCommentedTweets": "Top 10 Most Commented Tweets",
    "getNUserWithMostOfTweet": "Top Users by Tweet Count (Filtered by Category)",
    "getDistributionOfTweetsByDay": "Tweet Activity by Day",
    "getDistributionOfTop10HashtagByDay" : "Visualize Daily Distribution of Top 10 Hashtags by Selected Dates",
    "getFirstNWordsORNMentionORNHashtag" : "Display Top Trends"
  }
  
  //Parametri Query
  selectedQuery: string;
  //Parametri Bottoni
  isLoading: Record<string, boolean>;

  //Parametri query top10MostCommentedTweets
  top_ten_Comment: any[] | undefined;
  selectedTopic: string;
  //Parametri query getNUserWithMostOfTweet
  top_users: any[] | undefined;
  selectedOptions: string[] = [];
  n!:number;
  
  //Parametri query getDistributionOfTweetsByDat
  private datePicker!: ElementRef; //Elemento Grafico per prelevare le date
  statistic_dist_by_day:any[] | undefined;
  

  //Parametri query getDistributionOfTop10HashtagByDay
  statistic_top_ten_hashtag:any[] | undefined;

  //Parametri per selezionare le date in comune con getDistributionOfTop10HashtagByDay e getDistributionOfTweetsByDat
  startDate!:Date;
  endDate!:Date;
  //Metodi Per renderizzare l'elemento grafico datePicker
  @ViewChild('datePicker') set content(content: ElementRef) {
    this.datePicker = content;
    this.startDate=new Date(0);
    this.endDate=new Date();
    console.log(this.startDate)
    console.log(this.endDate)
    if(this.datePicker){
      this.initializeDateSelector(this.datePicker)
    }
  }

  //Parametri getFirstNMention getFirstNWords getFirstNHashtag
  //selectedOptions Attenzione condivisa con getNUserWithMostOfTweet
  selectedTrend:string="Words"
  top_N!:number;
  topN_mention!:any[];
  topN_words!:any[];
  topN_hashtag!:any[];

  constructor(private userService: UsersService) {
    this.selectedTopic = this.availableTopicOfTweets[0];
    this.selectedQuery = this.availableQueries[0];
    this.isLoading = {
      "button1": false,
      "button2": false,
      "button3":false,
      "button4":false,
      "button5":false
    }

  }

  

  private initializeDateSelector(datePicker: ElementRef){
    flatpickr(datePicker.nativeElement, {
        enableTime: false,
        dateFormat: 'd/m/Y',
        minDate: "25/08/2017",
        maxDate: "3/10/2017",
        mode: "range",
        onClose: (selectedDates: Date[], dateStr: string, instance: flatpickr.Instance) => {
          if (selectedDates.length > 0) {
            //Se viene selezionata solo una data, allora viene automaticamente preso tutto il range
            if (selectedDates.length == 1 ){
              instance.setDate([selectedDates[0],"3/10/2017"], true);
              selectedDates[1]=new Date("10/3/2017")
            }
            this.startDate= selectedDates[0]
            this.endDate=selectedDates[1];
          }
        }
    });
  }
  


  public top10MostCommentedTweets(idButton: string) {

    this.isLoading[idButton] = true
    this.userService.top10MostCommentedTweets(this.selectedTopic)
      .subscribe({
        next: (responseMessage) => {

          console.log(responseMessage.message);
          const jsonArray = responseMessage.data;
          console.log(jsonArray)
          this.isLoading[idButton] = false
          this.initializeTopTenComment(jsonArray)

        },
        error: (error) => {
          const httpErrorResponse: HttpErrorResponse = error;
          console.error(httpErrorResponse.message)
          this.isLoading[idButton] = false
        }
      })

  }

  public getNUserWithMostOfTweet(idButton: string) {

    this.isLoading[idButton] = true
    this.top_users=undefined;
    console.log(this.n)
    this.userService.getNUserWithMostOfTweet(this.n,this.selectedOptions)
      .subscribe({
        next: (responseMessage) => {
          console.log(responseMessage.message);
          const jsonArray = responseMessage.data;
          console.log(jsonArray)
          this.isLoading[idButton] = false
          this.initializeTopUsers(jsonArray)

        },
        error: (error) => {
          const httpErrorResponse: HttpErrorResponse = error;
          console.error(httpErrorResponse.message)
          this.isLoading[idButton] = false
        }
      })

  }


  public getDistributionOfTweetsByDay(idButton: string) {
    this.statistic_dist_by_day = undefined
    this.isLoading[idButton] = true
    var start_timestamp=0
    var end_timestamp=(new Date().getTime())

    if(this.startDate != undefined && this.endDate !=undefined){
      console.log("Le date le ho prese")
      start_timestamp=this.startDate.getTime();
      end_timestamp=this.endDate.getTime();
      console.log(this.startDate)
      console.log(this.endDate)
    }

    this.userService.getDistributionOfTweetsByDay(start_timestamp,end_timestamp)
      .subscribe({
        next: (responseMessage) => {
          console.log(responseMessage.message);
          const jsonArray = responseMessage.data;
          console.log(jsonArray)
          this.isLoading[idButton] = false
  
          this.initializeDistributionOfTweetsByDay(jsonArray)

        },
        error: (error) => {
          const httpErrorResponse: HttpErrorResponse = error;
          console.error(httpErrorResponse.message)
          this.isLoading[idButton] = false
        }
      })

  }
  public getDistributionOfTop10HashtagByDay(idButton:string){
    this.resetDataSetInMemory();
    this.isLoading[idButton] = true
    var start_timestamp=0
    var end_timestamp=(new Date().getTime())

    if(this.startDate != undefined && this.endDate !=undefined){
      start_timestamp=this.startDate.getTime();
      end_timestamp=this.endDate.getTime();
    }
    this.userService.getDistributionOfTop10HashtagByDay(start_timestamp,end_timestamp)
      .subscribe({
        next: (responseMessage) => {
          console.log(responseMessage.message);
          const jsonArray = responseMessage.data;
          console.log(jsonArray)
          this.isLoading[idButton] = false
          this.initializeDistributionOfTop10HashtagByDay(jsonArray)
          

        },
        error: (error) => {
          const httpErrorResponse: HttpErrorResponse = error;
          console.error(httpErrorResponse.message)
          this.isLoading[idButton] = false
        }
      })

  }

  public getTrend(idButton:string){
    if(this.selectedTrend=="Words"){
      this.getFirstNWords(idButton);
      
    }
    else if(this.selectedTrend=="Mentions"){
      this.getFirstNMention(idButton);
    }
    else this.getFirstNHashtag(idButton);
  }

  public getFirstNMention(idButton:string){
    this.isLoading[idButton]=true;
    this.userService.getFirstNMention(this.top_N,this.selectedOptions)
    .subscribe({
      next: (responseMessage) => {
        console.log(responseMessage.message);
        const jsonArray = responseMessage.data;
        console.log(jsonArray)
        this.isLoading[idButton] = false

        this.initializeFirstNMention(jsonArray)

      },
      error: (error) => {
        const httpErrorResponse: HttpErrorResponse = error;
        console.error(httpErrorResponse.message)
        this.isLoading[idButton] = false
      }
    })

  }

  public getFirstNWords(idButton:string){
    this.isLoading[idButton]=true;
    this.userService.getTopNWords(this.top_N,this.selectedOptions)
    .subscribe({
      next: (responseMessage) => {
        console.log(responseMessage.message);
        const jsonArray = responseMessage.data;
        console.log(jsonArray)
        this.isLoading[idButton] = false

        this.initializeFirstNWords(jsonArray)

      },
      error: (error) => {
        const httpErrorResponse: HttpErrorResponse = error;
        console.error(httpErrorResponse.message)
        this.isLoading[idButton] = false
      }
    })

  }

  public getFirstNHashtag(idButton:string){
    this.isLoading[idButton]=true;
    this.userService.getFirstNHashtag(this.top_N,this.selectedOptions)
    .subscribe({
      next: (responseMessage) => {
        console.log(responseMessage.message);
        const jsonArray = responseMessage.data;
        console.log(jsonArray)
        this.isLoading[idButton] = false
        this.initializeFirstNHashtag(jsonArray)

      },
      error: (error) => {
        const httpErrorResponse: HttpErrorResponse = error;
        console.error(httpErrorResponse.message)
        this.isLoading[idButton] = false
      }
    })

  }

  private initializeFirstNMention(jsonArray:any[]){
    this.topN_mention= jsonArray.map(jsonString => JSON.parse(jsonString))
    if(this.topN_mention.length==0) alert("No Results Found")
    console.log(this.topN_mention)
  }

  private initializeFirstNHashtag(jsonArray:any[]){
    this.topN_hashtag= jsonArray.map(jsonString => JSON.parse(jsonString))
    if(this.topN_hashtag.length==0) alert("No Results Found")
    console.log(this.topN_hashtag)
  }

  private initializeFirstNWords(jsonArray:any[]){
    this.topN_words= jsonArray.map(jsonString => JSON.parse(jsonString))
    if(this.topN_words.length==0) alert("No Results Found")
    console.log(this.topN_words)
  }

  private initializeTopUsers(twitterProfilesJson: string[]) {
    this.top_users = twitterProfilesJson.map(jsonString => JSON.parse(jsonString))
    if(this.top_users.length==0) alert("No Results Found")
    console.log(this.top_users)
  }

  private initializeTopTenComment(tweetJson: string[]) {
    this.top_ten_Comment = tweetJson.map(jsonString => JSON.parse(jsonString))
    if(this.top_ten_Comment.length==0) alert("No Results Found")
    console.log(this.top_ten_Comment)
  }

  private initializeDistributionOfTweetsByDay(statisticByDayJson: string[]){
    this.statistic_dist_by_day=statisticByDayJson.map(jsonString => JSON.parse(jsonString))
    if(this.statistic_dist_by_day.length==0) alert("No Results Found")
    console.log(this.statistic_dist_by_day)
  }

  private initializeDistributionOfTop10HashtagByDay(statisticByDayJson: string[]){
    this.statistic_top_ten_hashtag=statisticByDayJson.map(jsonString => JSON.parse(jsonString))
    if(this.statistic_top_ten_hashtag.length==0) alert("No Results Found")
    console.log(this.statistic_top_ten_hashtag)
  }



  public addTopic(topic: string) {
    if (this.selectedOptions.includes(topic)) {
      this.selectedOptions = this.selectedOptions.filter((element) => element !== topic);
    } else {
      this.selectedOptions.push(topic);
    }
    console.log(this.selectedOptions)
  }

  public removeTopicAll(): string[] {
    return this.availableTopicOfTweets.filter((element) => element != "All");
  }

  private resetDataSetInMemory(){
    this.statistic_top_ten_hashtag=undefined;
    this.top_ten_Comment=undefined
    this.top_users=undefined;
    this.statistic_dist_by_day=undefined;

  }




  
  
}



