import {Component, Input} from '@angular/core';
import {DateService} from "./shared/date.service";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {


  search = (value: string) => {
    console.log(value);
  }
}
