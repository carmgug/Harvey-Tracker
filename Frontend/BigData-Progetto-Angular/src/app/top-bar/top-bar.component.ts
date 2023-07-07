import { Component, OnInit ,Renderer2} from '@angular/core';





@Component({
  selector: 'app-top-bar',
  templateUrl: './top-bar.component.html',
  styleUrls: ['./top-bar.component.css']
  
})
export class TopBarComponent implements OnInit {
  
  title = 'Harvey Tracker';
  user : any;
  logged: boolean= false;
  
  ngOnInit(): void {

  }

  constructor(private renderer: Renderer2) { }


  ngAfterViewInit() {
    const navbarBurgers = Array.prototype.slice.call(document.querySelectorAll('.navbar-burger'), 0);
    if (navbarBurgers.length > 0) {
      navbarBurgers.forEach( el => {
        this.renderer.listen(el, 'click', () => {
          const target = el.dataset.target;
          const targetElement = document.getElementById(target);
          el.classList.toggle('is-active');
          targetElement?.classList.toggle('is-active');
        });
      });
    }
  }

  public works() {
    alert("Il tasto funziona!")
  }


}
