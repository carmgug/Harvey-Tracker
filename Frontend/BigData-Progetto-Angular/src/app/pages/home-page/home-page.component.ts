import { HttpErrorResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { UsersService } from 'src/app/services/users/users.service';

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.css']
})
export class HomePageComponent {


  text_in!:string;
  topicOfText!:string;
  loading_button_go:boolean;

  constructor(private userService:UsersService){
    this.loading_button_go=false;

  }


  public getTopic(){
    this.loading_button_go=true;
    this.userService.classifyByText(this.text_in)
    .subscribe({
      next: (responseMessage) => {
        console.log(responseMessage);
        const jsonArray =responseMessage.data;
        this.loading_button_go=false;
        const result=jsonArray.map(json=>JSON.parse(json))
        this.topicOfText=result[0].predictedLabel
      },
      error: (error)=> {
        this.loading_button_go=false;
        const httpErrorResponse: HttpErrorResponse = error;
        console.error(httpErrorResponse.message)
      }
    })
  }

}
