import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MapsAppComponent } from './pages/maps-page/maps-app.component';
import { HomePageComponent } from './pages/home-page/home-page.component';
import { StatisticPageComponent } from './pages/statistic-page/statistic-page.component';

const routes: Routes = [
  
  {
    path: 'visualizeMaps',
    component: MapsAppComponent
  },
  {
    path: '',
    component: HomePageComponent,
    pathMatch: 'full'
  },
  {
    path:'visualizeStatistic',
    component: StatisticPageComponent
  }

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
