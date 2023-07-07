import { Component, ElementRef, Input, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { Chart } from 'chart.js';

@Component({
  selector: 'app-top-trends-component',
  templateUrl: './top-trends-component.component.html',
  styleUrls: ['./top-trends-component.component.css']
})
export class TopTrendsComponentComponent implements OnChanges {


  @Input() top_n_words:any;
  @Input() top_n_hashtag:any;
  @Input() top_n_mention:any;
  @Input() selected_topics_w_input!:string[];
  @Input() selected_topics_h_input!:string[];
  @Input() selected_topics_m_input!:string[];
  selected_topics_w!:string[];
  selected_topics_h!:string[];
  selected_topics_m!:string[];

  histogramChart_w:any;
  histogramChart_h:any;
  histogramChart_m:any;


  topicAbbreviations:any={
    "relevant_information": "RI",
    "injured_or_dead_people": "IDP",
    "caution_and_advice": "CA",
    "displaced_and_evacuations": "DE",
    "sympathy_and_support": "SS",
    "response_efforts": "RE",
    "infrastructure_and_utilities_damage": "IUD",
    "personal": "P",
    "affected_individual": "AI",
    "not_related_or_irrelevant": "NRI",
    "missing_and_found_people": "MFP",
    "donation_and_volunteering": "DV"
  }


  @ViewChild('histogramChartWords') set wordsChart(content: ElementRef) {
    if(content && this.histogramChart_w==undefined){
      this.drawHistogramWords()
    }
  }

  @ViewChild('histogramChartMentions') set mentionsChart(content: ElementRef) {
    if(content && this.histogramChart_m==undefined){
      this.drawHistogramMentions()
    }
  }
  @ViewChild('histogramChartHashtags') set hashtagsChart(content: ElementRef) {
    if(content && this.histogramChart_h==undefined){
      this.drawHistogramHashtags()
    }
  }

  

  ngOnChanges(changes: SimpleChanges) {
    if (changes['top_n_words'] && this.top_n_words !== undefined) {
      this.selected_topics_w = this.selected_topics_w_input.map(option=> option)
      if(this.histogramChart_w){//Allora devi fare l'update perchè è gia stato disegnato precedentemente
        this.updateHistrogramChartWords();
      }
    }
    if (changes['top_n_mention'] && this.top_n_mention !== undefined) {
      this.selected_topics_m = this.selected_topics_m_input.map(option=> option)
      if(this.histogramChart_m){//Allora devi fare l'update perchè è gia stato disegnato precedentemente
        this.updateHistrogramChartMentions();
      }
    }
    if (changes['top_n_hashtag'] && this.top_n_hashtag !== undefined) {
      this.selected_topics_h = this.selected_topics_h_input.map(option=> option)
      if(this.histogramChart_h){//Allora devi fare l'update perchè è gia stato disegnato precedentemente
        console.log("Sono entrato nel metodo Update")
        this.updateHistrogramChartHashtag();
      }
    }
  }

  private updateHistrogramChartWords(){
    const labels=this.getWords();
    const data=this.getValueOfWords();
    this.histogramChart_w.data.labels=labels;
    this.histogramChart_w.data.datasets[0].data=data;
    this.histogramChart_w.update();
  }

  private drawHistogramWords(){
      const canvas: any=document.getElementById('histogramChartWords');
      const ctx=canvas.getContext('2d');
  
  
      this.histogramChart_w= new Chart(ctx,{
        type: 'bar',
        data: {
          labels: this.getWords(), // Array di date sull'asse x
          datasets: [{
            label: 'Word Usage',
            data: this.getValueOfWords(), // Array di numeri sull'asse y
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
      })
    
  }
  private updateHistrogramChartMentions(){
    const labels=this.getMentions();
    const data=this.getValueOfMentions();
    this.histogramChart_m.data.labels=labels;
    this.histogramChart_m.data.datasets[0].data=data;
    this.histogramChart_m.update();
  }

  private drawHistogramMentions(){
    const canvas: any=document.getElementById('histogramChartMentions');
    const ctx=canvas.getContext('2d');
    console.log("sono entrato nel metodo")


    this.histogramChart_m= new Chart(ctx,{
      type: 'bar',
      data: {
        labels: this.getMentions(), // Array di date sull'asse x
        datasets: [{
          label: 'User Tagging Frequency',
          data: this.getValueOfMentions(), // Array di numeri sull'asse y
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
    })
  
  }

  private updateHistrogramChartHashtag(){
    const labels=this.getHashtags();
    const data=this.getValueOfHashtags();
    this.histogramChart_h.data.labels=labels;
    this.histogramChart_h.data.datasets[0].data=data;
    this.histogramChart_h.update()
  }

  private drawHistogramHashtags(){
    const canvas: any=document.getElementById('histogramChartHashtags');
    const ctx=canvas.getContext('2d');
    console.log("sono entrato nel metodo")



    this.histogramChart_h= new Chart(ctx,{
      type: 'bar',
      data: {
        labels: this.getHashtags(), // Array di date sull'asse x
        datasets: [{
          label: 'Hashtag Frequency',
          data: this.getValueOfHashtags(), // Array di numeri sull'asse y
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
    })
  
}

  public getWords(){
    const res:string[]=[]
    for(const elem of this.top_n_words){
      res.push(elem.words)
    }
    return res;

  }

  public getValueOfWords(){
    const res:string[]=[]
    for(const elem of this.top_n_words){
      res.push(elem.Total)
    }
    return res;

  }

  public getMentions(){
    const res:string[]=[]
    for(const elem of this.top_n_mention){
      res.push(elem.user_mentions.name)
    }
    return res;

  }

  public getValueOfMentions(){
    const res:string[]=[]
    for(const elem of this.top_n_mention){
      res.push(elem.Total)
    }
    return res;

  }

  public getHashtags(){
    const res:string[]=[]
    for(const elem of this.top_n_hashtag){
      res.push(elem.hashtag)
    }
    return res;

  }

  public getValueOfHashtags(){
    const res:string[]=[]
    for(const elem of this.top_n_hashtag){
      res.push(elem.Total)
    }
    return res;

  }














}