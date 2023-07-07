import { Component, Input, OnInit } from '@angular/core';
import { Chart } from 'chart.js';
import { valueOrDefault } from 'chart.js/dist/helpers/helpers.core';
import {HashtagInfo} from 'src/app/utilities/HashtagInfo'


@Component({
  selector: 'app-box-top-ten-hashtag-dist',
  templateUrl: './box-top-ten-hashtag-dist.component.html',
  styleUrls: ['./box-top-ten-hashtag-dist.component.css']
})
export class BoxTopTenHashtagDistComponent implements OnInit{
  

  @Input() statistic_top_ten_hashtag!:any[];
  curr_hashtag:number;
  curr_day:number;
  curr_day_string!:string;
  most_frequent_hashtag!:string;
  least_frequent_hashtag!:string;
  index_mfh!:number;
  index_lfh!:number;
  summary_mfh:any;
  summary_lfh:any;


  histogramChart: any;
  pieChart: any;

  availableTopicOfTweets = ["relevant_information", "injured_or_dead_people",
    "caution_and_advice", "displaced_and_evacuations", "sympathy_and_support",
    "response_efforts", "infrastructure_and_utilities_damage", "personal",
    "affected_individual", "not_related_or_irrelevant", "missing_and_found_people",
    "donation_and_volunteering"] //Variabile per la labels del grafico a torta

  public constructor () {
    this.curr_hashtag=0;
    this.curr_day=0;
  }
  ngOnInit(): void {
    this.getMinAndMaxHashtag();
    this.summary_mfh=this.getSummuryInfo(this.statistic_top_ten_hashtag[this.index_mfh].info)
    this.summary_lfh=this.getSummuryInfo(this.statistic_top_ten_hashtag[this.index_mfh].info)
    this.generateHistogramChart();
    this.generatePieChart();
  }

  private generateHistogramChart(){
    const canvas: any=document.getElementById('histogramChart');
    const ctx=canvas.getContext('2d');


    this.histogramChart= new Chart(ctx,{
      type: 'bar',
      data: {
        labels: this.getDateArrayOfCurrHashtag(this.curr_hashtag), // Array di date sull'asse x
        datasets: [{
          label: 'Hashtag Daily Usage',
          data: this.getValuesArrayOfCurrHashtag(this.curr_hashtag), // Array di numeri sull'asse y
          backgroundColor: 'rgba(0, 123, 255, 0.5)',
          borderColor: 'rgba(0, 123, 255, 1)',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        scales: {
          y: {
            beginAtZero: true
          }
          
        }
      }
    })
  }

  private getValuesArrayOfCurrHashtag(index_hashtag:number){
    const infos:HashtagInfo[]=this.statistic_top_ten_hashtag[index_hashtag].info
    var res:number[]=[];
    for(const elem of infos){
      var curr_val=elem.Total
      res.push(curr_val)
    }
    return res;
  }

  private getDateArrayOfCurrHashtag(index_hashtag:number){
    const infos:HashtagInfo[]=this.statistic_top_ten_hashtag[index_hashtag].info
    var res:string[]=[];
    for(const elem of infos){
      var day=this.truncDay(elem.Day.toString());
      res.push(day)
    }
    return res;
  }


  private generatePieChart() {
    const canvas: any = document.getElementById('pieChart');
    const ctx = canvas.getContext('2d');

    const values = this.getValuesArrayPieChartOfCurrHashtag(this.curr_hashtag)
    const labels = this.availableTopicOfTweets;

    console.log(values)
    console.log(labels)

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
        maintainAspectRatio: true,
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



  private getValuesArrayPieChartOfCurrHashtag(index_curr_hashtag:number){
    const infos:HashtagInfo[]=this.statistic_top_ten_hashtag[index_curr_hashtag].info
    var res:number[]=[];
    const curr_hashtag_info:HashtagInfo=infos[this.curr_day]
    
    this.curr_day_string=this.truncDay(curr_hashtag_info.Day.toString());
    const entries=Object.entries(curr_hashtag_info)
    for(const entry of entries){
      const e_string=entry[0];
      const e_value=entry[1];
      if(e_string!="Day" && e_string!="Total"){
        res.push(e_value)
      }
    }
    return res;

  }
  
  public nextHashtagChart(){
    this.curr_hashtag=this.curr_hashtag+1;
    this.updateChartsOnChangeOfCurrHashtag();
  }

  public previousHashtagChart(){
    this.curr_hashtag=this.curr_hashtag-1;
    this.updateChartsOnChangeOfCurrHashtag();
  }

  private updateChartsOnChangeOfCurrHashtag(){
    const values_histogram=this.getValuesArrayOfCurrHashtag(this.curr_hashtag);
    const dateArray_histogram=this.getDateArrayOfCurrHashtag(this.curr_hashtag);
    this.histogramChart.data.datasets[0].data=values_histogram;
    this.histogramChart.data.labels=dateArray_histogram;
    
    this.curr_day=0;
    const values_pie=this.getValuesArrayPieChartOfCurrHashtag(this.curr_hashtag);
    this.pieChart.data.datasets[0].data=values_pie;
    
    this.histogramChart.update();
    this.pieChart.update();
  }

  public nextDayPieChart(){
    this.curr_day=this.curr_day+1
    const values_pie=this.getValuesArrayPieChartOfCurrHashtag(this.curr_hashtag);
    this.pieChart.data.datasets[0].data=values_pie;
    this.pieChart.update();
  }

  public previousDayPieChart(){
    this.curr_day=this.curr_day-1
    const values_pie=this.getValuesArrayPieChartOfCurrHashtag(this.curr_hashtag);
    this.pieChart.data.datasets[0].data=values_pie;
    this.pieChart.update();
  }

 
  public truncDay(date:string){
    const firstTenChars = date.substring(0, 10);
    return firstTenChars
  }

  private getMinAndMaxHashtag(){
    var index_min=0;
    var index_max=0;
    var max_h=this.statistic_top_ten_hashtag[0].hashtag;
    var min_h=this.statistic_top_ten_hashtag[0].hashtag;
    var max_occ=this.getTotalOccurrences(this.statistic_top_ten_hashtag[0].info);
    var min_occ=this.getTotalOccurrences(this.statistic_top_ten_hashtag[0].info);
    var index=0;
    for(var curr_h of this.statistic_top_ten_hashtag){
      var curr_h_infos:HashtagInfo[]=curr_h.info;
      var total_occ_of_curr_h=this.getTotalOccurrences(curr_h_infos);
      if(total_occ_of_curr_h>max_occ){
        max_occ=total_occ_of_curr_h;
        max_h=curr_h.hashtag
        index_max=index;
      }
      if(total_occ_of_curr_h<min_occ){
        min_occ=total_occ_of_curr_h;
        min_h=curr_h.hashtag
        index_min=index;
      }
      index+=1;
    }
    this.index_lfh=index_min;
    this.least_frequent_hashtag=min_h;
    this.index_mfh=index_max;
    this.most_frequent_hashtag=max_h;



  }

  //Input: Info riguardanti un hashtag
  //Output: Distribuzione Totale
  public getTotalOccurrences(hashtag_infos:HashtagInfo[]){
    var total=0;
    for(const h_i of hashtag_infos ){
      total+=h_i.Total
    }
    return total;
  }
  
  public getSummuryInfo(hashtag_infos:HashtagInfo[]){
    var summary:any={
      "injured_or_dead_people": 0,
      "relevant_information": 0,
      "caution_and_advice": 0,
      "displaced_and_evacuations": 0,
      "sympathy_and_support": 0,
      "response_efforts": 0,
      "infrastructure_and_utilities_damage": 0,
      "personal": 0,
      "affected_individual": 0,
      "not_related_or_irrelevant": 0,
      "missing_and_found_people": 0,
      "donation_and_volunteering": 0
    }
    for(const h_i of hashtag_infos){
      const entries=Object.entries(h_i)
      for (const entry of entries){
        const e_string=entry[0] as string
        if(e_string!="Total" && e_string!="Day"){
          summary[e_string]=summary[e_string]+entry[1]
        }
      }
    }
    return summary;
  }

}
