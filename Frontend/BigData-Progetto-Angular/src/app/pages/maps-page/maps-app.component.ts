import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, Input,ViewChild,ElementRef } from '@angular/core';
import * as L from 'leaflet';
import { MapsService } from 'src/app/services/maps/maps.service';
import { GeoLocation, MarkerMap } from 'src/app/utilities/Markermap';
import { ResponseMessage } from 'src/app/utilities/ResponseMessage';
//Per leggere i BIGINT

import * as JSONbig from 'json-bigint';
//Seleziona Date
import flatpickr from "flatpickr";
//Disegna Grafici
import Chart from 'chart.js/auto';
import { animate, style, transition, trigger } from '@angular/animations';
import { NONE_TYPE } from '@angular/compiler';

//Pulsante Rimuovi Marker

@Component({
  selector: 'app-maps-app',
  templateUrl: './maps-app.component.html',
  styleUrls: ['./maps-app.component.css'],
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
export class MapsAppComponent  implements OnInit {
  @ViewChild('myCanvas', { static: true })
  canvas!: ElementRef;
  ctx: CanvasRenderingContext2D | undefined;

  availableTopicOfTweets = ["relevant_information","injured_or_dead_people",
  "caution_and_advice","displaced_and_evacuations","sympathy_and_support",
  "response_efforts","infrastructure_and_utilities_damage","personal",
  "affected_individual","not_related_or_irrelevant","missing_and_found_people",
  "donation_and_volunteering"]

  //Parametri Mappa
  map!: L.Map;
  layerControl: L.Control.Layers | undefined;
  selected_marker_on_map: L.Marker | undefined; //Marker messo sulla mappa
  circle_on_map:L.Circle|undefined;

  //Parametri Query getGeoByDateAndTopic
  selectedTopic!:string;
  startDate!:Date;
  endDate!:Date;
  //Parametri Query getTweetByTweetID
  selectedTweetID!:number;
  tweet!:any;
  //Parametri Query getPointsNeareastP
  selected_point!:L.LatLng;
  selected_point_lat!:number ;
  selected_point_lng!:number ;
  selected_km!:number;

  //Parametri Bottoni
  isLoading:Record<string, boolean>;
  iconColor:Record<string,L.Icon>;
  //Layer Maps
  layers:Record<string,L.LayerGroup>;

  constructor(private mapsServices:MapsService){
    this.selectedTopic=this.availableTopicOfTweets[0];
    this.isLoading={
      "button1":false,
      "button2":false,
      "button3":false
    }
    this.layers={}
    this.iconColor=this.getDictonaryOfColorIcon()
  }
  ngOnInit(): void {
    this.map = L.map('mapid').setView([32.79755357,-96.77401775],13);

    var osm=L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>'
    });

    osm.addTo(this.map)
    var baseMaps = {
      "OpenStreetMap": osm
    }
    this.layerControl=L.control.layers(baseMaps).addTo(this.map);
    this.initializeMarkerOnClick()
    this.initializeDateSelector();
  }

  //Initialize Button Remove Marker and Click On Map to visualize Marker
  private initializeMarkerOnClick(){
    //Put marker on the map after a click
    this.map.on("click", e => {
      console.log(e.latlng); // get the coordinates after a click on map
      this.selected_point=e.latlng;
      this.selected_point_lat=this.selected_point.lat
      this.selected_point_lng=this.selected_point.lng
      this.removeMarker();
      this.drawMarker();
    });
    
    
  }
  private drawMarker(){
    this.selected_marker_on_map=L.marker([this.selected_point_lat, this.selected_point_lng],{icon:this.iconColor["custom_point"]}).addTo(this.map);

      //Setting Schema PopUp
      const div = document.createElement("div");
      div.innerHTML = `<p><strong>YOUR POINT</strong></p>`;

      const button = document.createElement("button");
      button.innerHTML = "Rimuovi";
      button.className= "button is-rounded is-link is-outlined is-small";
      button.addEventListener("click", () => {
        this.removeMarker()
      });
      div.appendChild(button);
      this.selected_marker_on_map.bindPopup(div);
  }

  private removeMarker() {
    if (this.selected_marker_on_map) {
      this.selected_marker_on_map.remove();
      this.selected_marker_on_map=undefined;
    }
  };
  private drawCircle(){
    this.circle_on_map= L.circle([this.selected_point_lat, this.selected_point_lng],{
      color:'red',
      fillColor: '#f03',
      fillOpacity: 0.2,
      radius: this.selected_km * 1000
    })
    var overlay= L.layerGroup([this.circle_on_map]);
    this.map?.addLayer(overlay);
    this.layers["circle"]=overlay
    this.layerControl?.addOverlay(overlay, "circle");
  }
  private removeCircle(){
    if(this.circle_on_map){
      var curr_layers=this.layers["circle"]
      this.layerControl?.removeLayer(curr_layers)
      this.map?.removeLayer(curr_layers)
      this.circle_on_map.remove()
      this.circle_on_map=undefined;
    }
    
  }
  /* Query 9  */
  public getAllGEOAndTweetIDNearestP(idButton:string){
    this.removeCircle();
    this.removeMarker();
    this.drawMarker();
    this.drawCircle();
    this.isLoading[idButton]=true
    this.mapsServices.getAllGEOAndTweetIDNearestP(this.selected_point_lat,this.selected_point_lng,this.selected_km)
    .subscribe({
      next: (responseMessage) => {
        console.log(responseMessage);
        const jsonArray =responseMessage.data;
        this.isLoading[idButton]=false
        this.drawLayerOfPointsNearestP(jsonArray)
      },
      error: (error)=> {
        this.isLoading[idButton]=false
        const httpErrorResponse: HttpErrorResponse = error;
        console.error(httpErrorResponse.message)
      }
    })
  }

  private drawLayerOfPointsNearestP(jsonArray:string[]){
    const markers:MarkerMap[]= jsonArray.map(jsonString=>JSONbig.parse(jsonString))
    const label:string="points_nearest_p";
    console.log(markers);
    const markerArray = markers.map((elem) => {
      const coordinates: [number, number] = elem.geo.coordinates;
      const currMarker=L.marker(coordinates, {icon: this.iconColor[elem.Category]})
      const pop_up_message=this.initializePopMessageOfMarkers(elem);
      currMarker.bindPopup(pop_up_message);
      return currMarker;
    });
    this.drawOverlay(label,markerArray)

  }

  private initializePopMessageOfMarkers_OLD(marker:MarkerMap){
    
    const div2= document.createElement("div");
    div2.innerHTML = `<p><strong>Date:</strong> ${this.mapsServices.transformDate(marker.Date.toString())}</p>
    <p><strong>Coordinates:</strong> ${marker.geo.coordinates}</p>
    </div>`

    const iconElement = document.createElement('i');
    iconElement.className="fa-solid fa-copy icon"
    iconElement.style.color = '#4a74c1';
    iconElement.addEventListener("click", () => {
      this.selectedTweetID=marker.TweetID
    });



    const div = document.createElement("div");
    div.innerHTML = `
    <div>
      <p id="textToCopy"><strong>Tweet ID:</strong> ${marker.TweetID} ${iconElement.outerHTML}
      </p>
    `;
    div.appendChild(div2)
    console.log(div)
    return div;

  }

  private transformDate(date:string):string{
    return this.mapsServices.transformDate(date)
  }

  private initializePopMessageOfMarkers(marker:MarkerMap){
    
    const divElement=document.createElement('div');
    //Prima riga TweetID: ID Tasto Copia
    const paragraphTweetID = document.createElement('p');
    const titleTweetID = document.createElement('strong')
    titleTweetID.innerHTML=`TweetID:&nbsp;`
    const paragraphText = document.createTextNode(marker.TweetID.toString());
    //Tasto Copia
    const iconElement = document.createElement('a');
    iconElement.className="fa-solid fa-copy icon"
    iconElement.style.color = '#4a74c1';
    iconElement.addEventListener("click", () => {
      this.selectedTweetID=marker.TweetID
    });
    paragraphTweetID.appendChild(titleTweetID);
    paragraphTweetID.appendChild(paragraphText);
    paragraphTweetID.appendChild(iconElement);
    divElement.appendChild(paragraphTweetID)
    //Seconda riga Date:
    const paragraphDate= document.createElement('p');
    const titleDate=document.createElement('strong');
    titleDate.innerHTML=`Date:&nbsp;`
    const dateToString:string=this.transformDate(marker.Date.toString());
    const paragraphText_Date = document.createTextNode(dateToString);
    paragraphDate.appendChild(titleDate);
    paragraphDate.appendChild(paragraphText_Date);
    divElement.appendChild(paragraphDate);
    //Terza riga Cordinate
    const paragraphPos= document.createElement('p');
    const titlePos= document.createElement('strong')
    titlePos.innerHTML=`Coordinates:&nbsp;`
    const paragraphText_Pos=document.createTextNode(marker.geo.coordinates.toString())
    paragraphPos.appendChild(titlePos);
    paragraphPos.appendChild(paragraphText_Pos)
    divElement.appendChild(paragraphPos);
    console.log(divElement.outerHTML)
    return divElement;

  }

  /* Query 1. */
  public getGeoByDateAndTopic(idButton:string) {

    const selectedTopic = this.selectedTopic;
    this.isLoading[idButton]=true
    var start_timestamp=0
    var end_timestamp=(new Date().getTime())

    if(this.startDate != undefined && this.endDate !=undefined){
      start_timestamp=this.startDate.getTime();
      end_timestamp=this.endDate.getTime();
    }

    this.mapsServices.getGeoByDateAndTopic(start_timestamp,end_timestamp,selectedTopic)
      .subscribe({
        next: (responseMessage) =>{
          console.log(responseMessage);
          const jsonArray = responseMessage.data;
          console.log(jsonArray)
          this.constructOverlayerOfLMarkerAndDraw(jsonArray,this.selectedTopic)
          this.isLoading[idButton]=false

        },
        error: (error)=> {
          const httpErrorResponse: HttpErrorResponse = error;
          console.error(httpErrorResponse.message)

          this.isLoading[idButton]=false
        }
      })
  }

  private constructOverlayerOfLMarkerAndDraw(jsonArray:string[],selectedTopic:string){
    const markersMap:MarkerMap[] = jsonArray.map(jsonString => JSONbig.parse(jsonString));
    console.log(markersMap)
    const markerArray = markersMap.map((elem) => {
      const coordinates: [number, number] = elem.geo.coordinates;
      const currMarker=L.marker(coordinates, {icon: this.iconColor[selectedTopic]})
      const pop_up_message:HTMLDivElement=this.initializePopMessageOfMarkers(elem)
      currMarker.bindPopup(pop_up_message);
      return currMarker;
    });
    this.drawOverlay(selectedTopic,markerArray)
  }
  
  /* Query di Supporto */
  public getTweetByTweetID(idButton:string){
    this.isLoading[idButton]=true
    console.log(this.selectedTweetID)
    this.tweet=undefined

    this.mapsServices.getTweetByTweetID(this.selectedTweetID)
      .subscribe({
        next: (responseMessage) => {
          console.log(responseMessage);
          const jsonArray =responseMessage.data;
          this.initializeTweet(jsonArray)
          this.isLoading[idButton]=false
        },
        error: (error)=> {
          const httpErrorResponse: HttpErrorResponse = error;
          console.error(httpErrorResponse.message)

          this.isLoading[idButton]=false
        }
      })
  }
  private initializeTweet(jsonArray:string[]){
    //It's a json array but the element is only one if exist
    const tweet=JSON.parse(jsonArray[0])
    this.tweet=tweet;
  }

  /*Metodi Per gestire la mappa e visualizare correttamente gli elementi */
  private drawOverlay(selectedTopic:string,markerArray:L.Marker[]){
    if(selectedTopic in this.layers){
      var curr_layers=this.layers[selectedTopic]
      this.layerControl?.removeLayer(curr_layers)
      this.map?.removeLayer(curr_layers)
    }
    var overlay= L.layerGroup(markerArray);
    this.map?.addLayer(overlay);
    this.layers[selectedTopic]=overlay
    this.layerControl?.addOverlay(overlay, selectedTopic);
  }

  public formatString(str: string): string {
    return str.replace(/_/g, ' ').replace(/^\w/, (c) => c.toUpperCase());
  }

  private getDictonaryOfColorIcon(): Record<string,L.Icon>{
    
    const pinIcon = new L.Icon({
      iconUrl: '/assets/icons/pin.png',
      shadowUrl: '/assets/icons/marker-shadow.png',
      iconSize: [41, 41],
      iconAnchor: [20, 41],
      popupAnchor: [1, -25],
      shadowSize: [0, 0]
    });
    
    const blueIcon = new L.Icon({
      iconUrl: '/assets/icons/marker-icon-2x-blue.png',
      shadowUrl: '/assets/icons/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });

    const goldIcon = new L.Icon({
      iconUrl: '/assets/icons/marker-icon-2x-gold.png',
      shadowUrl: '/assets/icons/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });

    const redIcon = new L.Icon({
      iconUrl: '/assets/icons/marker-icon-2x-red.png',
      shadowUrl: '/assets/icons/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });

    const greenIcon = new L.Icon({
      iconUrl: '/assets/icons/marker-icon-2x-green.png',
      shadowUrl: '/assets/icons/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });

    const orangeIcon = new L.Icon({
      iconUrl: '/assets/icons/marker-icon-2x-orange.png',
      shadowUrl: '/assets/icons/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });

    const yellowIcon = new L.Icon({
      iconUrl: '/assets/icons/marker-icon-2x-yellow.png',
      shadowUrl: '/assets/icons/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });

    const violetIcon = new L.Icon({
      iconUrl: '/assets/icons/marker-icon-2x-violet.png',
      shadowUrl: '/assets/icons/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });

    const greyIcon = new L.Icon({
      iconUrl: '/assets/icons/marker-icon-2x-grey.png',
      shadowUrl: '/assets/icons/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });

    const blackIcon = new L.Icon({
      iconUrl: '/assets/icons/marker-icon-2x-black.png',
      shadowUrl: '/assets/icons/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });


    const exitIcon = new L.Icon({
      iconUrl: '/assets/icons/exit.png',
      shadowUrl: '/assets/icons/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize:[0,0]
    });

    const mistery = new L.Icon({
      iconUrl: '/assets/icons/mistery.png',
      shadowUrl: '/assets/icons/marker-shadow.png',

      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize:[0,0]
    });

    const injuredIcon = new L.Icon({
      iconUrl: '/assets/icons/injured.png',
      shadowUrl: '/assets/icons/marker-shadow.png',


      iconSize: [35, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize:[0,0]


    });

    return {"custom_point":pinIcon,"relevant_information":blueIcon,"injured_or_dead_people":injuredIcon,"caution_and_advice":redIcon,
            "displaced_and_evacuations":exitIcon,"sympathy_and_support":greenIcon,"response_efforts":orangeIcon,
            "infrastructure_and_utilities_damage":yellowIcon,"personal":violetIcon,"affected_individual":blackIcon,
            "not_related_or_irrelevant":greyIcon,"missing_and_found_people":mistery
      ,"donation_and_volunteering":goldIcon}

  }
  private initializeDateSelector(){
    flatpickr('#start-date', {

      enableTime: true,
      dateFormat: 'd/m/Y H:i',
      minDate: "25/08/2017 00:00",
      maxDate: "3/10/2017 00:00",
      mode: "range",

      onClose: (selectedDates: Date[], dateStr: string, instance: flatpickr.Instance) => {
        if (selectedDates.length > 0) {
          //Se viene selezionata solo una data, allora viene automaticamente preso tutto il range
          if (selectedDates.length == 1 ){
            instance.setDate([selectedDates[0],"3/10/2017 00:00"], true);
          }
          this.startDate = selectedDates[0]
          this.endDate=selectedDates[1];
        }
      }

    });

  }




}
