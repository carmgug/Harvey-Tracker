import { animate, style, transition, trigger } from '@angular/animations';
import { Component,Input,OnInit } from '@angular/core';
import { Chart } from 'chart.js/auto'; // Import Chart from the correct file path
import { statisticOfADay } from 'src/app/utilities/statisticByDay';

@Component({
  selector: 'app-box-istogramma-tweets-by-day',
  templateUrl: './box-istogramma-tweets-by-day.component.html',
  styleUrls: ['./box-istogramma-tweets-by-day.component.css'],
  animations: [
    trigger(
      'inOutAnimation', [
        transition(':enter', [
          style({transform: 'translateY(-100%)', opacity: 0}),
          animate('500ms', style({transform: 'translateY(0)', opacity: 1}))
        ])
      ]
    )
  ]
})
export class BoxIstogrammaTweetsByDayComponent implements OnInit{

  histogramChart!: any; // Riferimento istogramma
  pieChart!: any; //Riferimento grafico a torta
  @Input() statistic_dist_by_day!:statisticOfADay[];
  dateArray:string[]=[]
  valuesArray:number[]=[]

  //Variabili per il grafico a torta
  availableTopicOfTweets = ["relevant_information", "injured_or_dead_people",
    "caution_and_advice", "displaced_and_evacuations", "sympathy_and_support",
    "response_efforts", "infrastructure_and_utilities_damage", "personal",
    "affected_individual", "not_related_or_irrelevant", "missing_and_found_people",
    "donation_and_volunteering"]
  currDay!:number;
  maxDay!:number;

  //Variabili Statistiche
  mostTweetPublishedDay!:statisticOfADay;
  fewestTweetPublishedDay!: statisticOfADay;
  mostFrequentCategoryOfDay: Record<string,string>={}
  leastFrequentCategoryOfDay: Record<string,string>={}

 


  ngOnInit() {
    if(this.statistic_dist_by_day){
      for (const item of this.statistic_dist_by_day){
          
          this.dateArray.push(this.truncDay(item.Day))
          this.valuesArray.push(item.Total)
      }
    }
    this.currDay=0;
    this.maxDay=this.statistic_dist_by_day.length;
    this.generateHistogramChart();
    this.generatePieChart();
    this.getStatisticDayWithMaxAndMinNumberOfTweets();
    this.initializeStatisticOfCurrDay(this.getValues())


  }

  public truncDay(date:string){
    const firstTenChars = date.substring(0, 10);
    return firstTenChars
  }

  public formatString(str: string): string {
    return str.replace(/_/g, ' ').replace(/^\w/, (c) => c.toUpperCase());
  }

  public getKeyByTopic(topic:string){
    return topic as keyof statisticOfADay;
  }

  private getStatisticDayWithMaxAndMinNumberOfTweets(){
    var index_max:number=0;
    var index_min:number=0;
    var index:number=0;
    var max_day:string=this.statistic_dist_by_day[0].Day;
    var min_day:string=this.statistic_dist_by_day[0].Day;
    var val_max:number=this.statistic_dist_by_day[0].Total;
    var val_min:number=this.statistic_dist_by_day[0].Total;
    for (const item of this.statistic_dist_by_day){
      var curr_day=item.Day;
      var curr_val=item.Total;
      if(curr_val>val_max){
        max_day=curr_day;
        val_max=curr_val;
        index_max=index;
      }
      if(curr_val<val_min){
        min_day=curr_day;
        val_min=curr_val;
        index_min=index;
      }
      index++;
    }
    this.mostTweetPublishedDay=this.statistic_dist_by_day[index_max];
    this.fewestTweetPublishedDay=this.statistic_dist_by_day[index_min];
  }

  

  private generateHistogramChart() {
    const canvas: any = document.getElementById('histogramChart');
    const ctx = canvas.getContext('2d');

    this.histogramChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: this.dateArray, // Array di date sull'asse x
        datasets: [{
          label: 'Twitter posts published during the day',
          data: this.valuesArray, // Array di numeri sull'asse y
          backgroundColor: 'rgba(0, 123, 255, 0.5)',
          borderColor: 'rgba(0, 123, 255, 1)',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true
          }
          
        }
      }
    });
  }

  private generatePieChart() {
    const canvas: any = document.getElementById('pieChart');
    const ctx = canvas.getContext('2d');

    const values = this.getValues(); 
    const labels = this.availableTopicOfTweets;

    const colors: string[] = [
      'rgba(255, 0, 0,0.5)',       // Rosso
      'rgba(0, 255, 0,0.5)',       // Verde
      'rgba(0, 0, 255,0.5)',       // Blu
      'rgba(255, 255, 0,0.5)',     // Giallo
      'rgba(255, 0, 255,0.5)',     // Magenta
      'rgba(0, 255, 255,0.5)',     // Ciano
      'rgba(128, 0, 0,0.5)',       // Marrone scuro
      'rgba(0, 128, 0,0.5)',       // Verde scuro
      'rgba(0, 0, 128,0.5)',       // Blu scuro
      'rgba(128, 128, 0,0.5)',     // Olive
      'rgba(128, 0, 128,0.5)',     // Viola
      'rgba(0, 128, 128,0.5)'      // Teal
    ];

    const colors_2: string[] = [
      'rgba(255, 0, 0,1)',       // Rosso
      'rgba(0, 255, 0,1)',       // Verde
      'rgba(0, 0, 255,1)',       // Blu
      'rgba(255, 255, 0,1)',     // Giallo
      'rgba(255, 0, 255,1)',     // Magenta
      'rgba(0, 255, 255,1)',     // Ciano
      'rgba(128, 0, 0,1)',       // Marrone scuro
      'rgba(0, 128, 0,1)',       // Verde scuro
      'rgba(0, 0, 128,1)',       // Blu scuro
      'rgba(128, 128, 0,1)',     // Olive
      'rgba(128, 0, 128,1)',     // Viola
      'rgba(0, 128, 128,1)'      // Teal
    ];

    this.pieChart = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: labels,
        datasets: [{
          data: values,
          backgroundColor: colors,
          borderColor: colors_2,
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          tooltip: {
            callbacks: {
              label: (context) => {
                const value = context.parsed;
                const sum = context.dataset.data.reduce((a, b) => a + b, 0);
                const percentage = ((value * 100) / sum).toFixed(1) + '%';
                return percentage;
              }
            }
          },
          legend: {
            display: true, // Nascondi le etichette della legenda
            labels: {
              font: {
                size: 11
              }
            },
            position : 'right'
          }
        }
      }
    });

  }

  private getValues(): number[] {
    const topicsValues: number[] = [];
    for (let i = 0; i < this.availableTopicOfTweets.length; i++) {
      const total=this.statistic_dist_by_day[0].Total
      const index_topic:keyof statisticOfADay=this.availableTopicOfTweets[i] as keyof statisticOfADay;
      const element:statisticOfADay=this.statistic_dist_by_day[0]
      const value:number=element[index_topic] as number;
      topicsValues.push(value);
    }
    return topicsValues;
  }

  public nextDayChart() {
    this.currDay=this.currDay+1;
    const topicsValues: number[] = [];


    for (let i = 0; i < this.availableTopicOfTweets.length; i++) {
      const total=this.statistic_dist_by_day[this.currDay].Total
      const index_topic:keyof statisticOfADay=this.availableTopicOfTweets[i] as keyof statisticOfADay;
      const element:statisticOfADay=this.statistic_dist_by_day[this.currDay]
      const value:number=element[index_topic] as number;
      topicsValues.push(value);
    }

    this.pieChart.data.datasets[0].data=topicsValues
    this.initializeStatisticOfCurrDay(topicsValues)


    this.pieChart.update();
    this.pieChart.render();

  }
  public previousDayChart(){
    this.currDay=this.currDay-1;
    const topicsValues: number[] = [];


    for (let i = 0; i < this.availableTopicOfTweets.length; i++) {
      const total=this.statistic_dist_by_day[this.currDay].Total
      const index_topic:keyof statisticOfADay=this.availableTopicOfTweets[i] as keyof statisticOfADay;
      const element:statisticOfADay=this.statistic_dist_by_day[this.currDay]
      const value:number=element[index_topic] as number;
      topicsValues.push(value);
    }

    this.pieChart.data.datasets[0].data=topicsValues
    

    this.initializeStatisticOfCurrDay(topicsValues)
    


    this.pieChart.update();
    this.pieChart.render();
  }

  private getPercentage(indexOfCurrDay:number,value:number){

    const percentage = (( value * 100) / this.statistic_dist_by_day[indexOfCurrDay].Total).toFixed(1) + '%';

    return percentage;
  }


  private initializeStatisticOfCurrDay(topicsValues:number[]){

    const max = Math.max(...topicsValues);
    const maxIndex = topicsValues.indexOf(max);
    const min= Math.min(...topicsValues);
    const minIndex= topicsValues.indexOf(min);
    const percentageMax=this.getPercentage(this.currDay,max);
    const percentageMin=this.getPercentage(this.currDay,min);

    //Most Frequent
    this.mostFrequentCategoryOfDay={
      'Topic':this.availableTopicOfTweets[maxIndex],
      'Value':max.toString(),
      'Percentage':percentageMax
    }
    //Least Frequent
    this.leastFrequentCategoryOfDay={
      'Topic':this.availableTopicOfTweets[minIndex],
      'Value':min.toString(),
      'Percentage':percentageMin
    }

  }
}









