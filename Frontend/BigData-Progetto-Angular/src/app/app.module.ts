import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
//Per legare il valore della variabile nella pagina HTML al component
import { FormsModule } from '@angular/forms'; // import FormsModule
//Per effettuar e*ngFro
import { CommonModule, DatePipe } from '@angular/common';
//Per effettuare la selezione delle date





import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { TopBarComponent } from './top-bar/top-bar.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { StatisticPageComponent} from './pages/statistic-page/statistic-page.component';
import { HomePageComponent } from './pages/home-page//home-page.component';

/*Angular Material */
import {MatIconModule} from '@angular/material/icon';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatButtonModule} from '@angular/material/button';
import { MapsAppComponent } from './pages/maps-page/maps-app.component';
//Http
import { HttpClientModule } from '@angular/common/http';
//Pagination
import { NgxPaginationModule } from 'ngx-pagination';
import { BoxOfTweetsComponent } from './pages/statistic-page/components/box-of-tweets/box-of-tweets.component';
import { BoxOfUsersComponent, MyRadarChartComponent } from './pages/statistic-page/components/box-of-users/box-of-users.component';
import { BoxIstogrammaTweetsByDayComponent } from './pages/statistic-page/components/box-istogramma-tweets-by-day/box-istogramma-tweets-by-day.component';
import { TweetBoxComponent } from './pages/maps-page/components/tweet-box/tweet-box.component';
import { BoxTopTenHashtagDistComponent } from './pages/statistic-page/components/box-top-ten-hashtag-dist/box-top-ten-hashtag-dist.component';
import { TopTrendsComponentComponent } from './pages/statistic-page/components/top-trends-component/top-trends-component.component';
//Select More Than one Option



@NgModule({
  declarations: [
    AppComponent,
    TopBarComponent,
    MapsAppComponent,
    HomePageComponent,
    StatisticPageComponent,
    BoxOfTweetsComponent,
    BoxOfUsersComponent,
    BoxIstogrammaTweetsByDayComponent,
    TweetBoxComponent,
    MyRadarChartComponent,
    BoxTopTenHashtagDistComponent,
    TopTrendsComponentComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatIconModule,
    MatToolbarModule,
    MatButtonModule,
    HttpClientModule,
    FormsModule,
    CommonModule,
    NgxPaginationModule
],
  providers: [DatePipe],
  bootstrap: [AppComponent]
})
export class AppModule { }
