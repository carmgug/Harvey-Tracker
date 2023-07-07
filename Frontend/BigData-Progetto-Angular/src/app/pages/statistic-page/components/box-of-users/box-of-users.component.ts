import { animate, style, transition, trigger } from '@angular/animations';
import { Component , ElementRef, Input, OnInit, ViewChild} from '@angular/core';
import { DatePipe } from '@angular/common';


@Component({
  selector: 'app-box-of-users',
  templateUrl: './box-of-users.component.html',
  styleUrls: ['./box-of-users.component.css'],
  animations: [
    trigger(
      'inOutAnimation', [
        transition(':enter', [
          style({transform: 'translateX(100%)', opacity: 0}),
          animate('500ms', style({transform: 'translateX(0)', opacity: 1}))
        ])
      ]
    )
  ],
  providers: [DatePipe]
})
export class BoxOfUsersComponent implements OnInit{

  @Input() users: any[] | undefined;
  @Input() selectedOptions_input!: string[];
  selectedOptions!:string[]

  page:number=1

  availableTopicOfTweets = ["relevant_information","injured_or_dead_people",
  "caution_and_advice","displaced_and_evacuations","sympathy_and_support",
  "response_efforts","infrastructure_and_utilities_damage","personal",
  "affected_individual","not_related_or_irrelevant","missing_and_found_people",
  "donation_and_volunteering"]

  topicAbbreviations:Record<string,string>={
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

  constructor(private datePipe: DatePipe) { }

  ngOnInit(){
    this.selectedOptions = this.selectedOptions_input.map(option=> option)
  }


  public transformDate(dateString:string){
    const date = new Date(dateString);
    const formattedDate = this.datePipe.transform(date, 'dd/MM/yyyy HH:mm:ss');
    return formattedDate

  }


  public nextPage(){
    console.log(this.page)
    this.page=this.page+1
  }

  public previousPage(){
    console.log(this.page)
    this.page=this.page-1
  }

  public downloadCSV(id:string) {
    
      var csvContent = "data:text/csv;charset=utf-8,";

      // Ottieni la tabella HTML
      var table = document.getElementById(id);

      if(table){

        // Ottieni gli header della tabella
        var headers = table.querySelectorAll("th");

        // Aggiungi le intestazioni alla stringa CSV
        var headerRow = Array.from(headers).map(function(header) {
          return header.title;
        }).join(";");
        csvContent += "USER_ID;" + headerRow + "\n";

        // Ottieni le righe della tabella
        var rows = table.querySelectorAll("tbody tr");

        // Elabora ogni riga della tabella
        Array.from(rows).forEach(function(row) {
          var rowData: string[] = [];

          // Elabora ogni cella della riga
          var cells = row.querySelectorAll("td");
          Array.from(cells).forEach(function(cell) {
            rowData.push(cell.innerText);
          });

          // Unisci le celle in una riga CSV
          var rowCSV = rowData.join(";");
          csvContent += id+";"+rowCSV + "\n";
        });

        // Crea un elemento <a> per il download
        var encodedUri = encodeURI(csvContent);
        var link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "table.csv");
        document.body.appendChild(link);

        // Simula il click sul link per avviare il download
        link.click();
      }
    
  }

}

import { Chart, ChartConfiguration, ChartTypeRegistry } from 'chart.js';
import { __runInitializers } from 'tslib';

@Component({
  selector: 'radarchart-user',
  template: '<div class="is-flex is-justify-content-center is-align-items-center"><canvas #chartCanvas></canvas></div>',
})
export class MyRadarChartComponent implements OnInit {
  @Input() topics!:string[];
  @Input() user!:Record<string,any>;
  @Input() name!:string;
  
  @ViewChild('chartCanvas', { static: true }) chartCanvas!: ElementRef;

  radarchart!:any;
  dataset:number[];
  labels:string[];


  topicAbbreviations:Record<string,string>;

  public constructor() {
    this.labels=[]
    this.dataset=[]
    this.topicAbbreviations={
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
    
  }

  ngOnInit(): void {
    this.initializeDataSet();
    this.drawRadarChart();
  }

  private initializeDataSet(){
    for (const topic of this.topics){
      const elem:any[]=this.user[topic];
      const abbreviations=this.topicAbbreviations[topic]
      var confidence:number=0;
      if(elem[1]){
        confidence=elem[1]*100
      }
      this.dataset.push(confidence)
      this.labels.push(abbreviations)
    }
  }

  private drawRadarChart(){
    const canvasElement: any = this.chartCanvas.nativeElement as HTMLCanvasElement;
    const ctx = canvasElement.getContext('2d');
    const data = {
      labels: this.labels,
      datasets: [{
        label: this.name,
        data: this.dataset,
        fill: true,
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        borderColor: 'rgb(255, 99, 132)',
        pointBackgroundColor: 'rgb(255, 99, 132)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgb(255, 99, 132)'
      }]
    };

    const config : ChartConfiguration<keyof ChartTypeRegistry> = {
      type: 'radar',
      data: data,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        elements: {
          line: {
            borderWidth: 3
          }
        },
      },
    };
    this.radarchart=new Chart(ctx,config);
  }
}
