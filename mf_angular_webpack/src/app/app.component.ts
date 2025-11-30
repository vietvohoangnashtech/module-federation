import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'Angular Module Federation';
  
  constructor() {
    console.log('✅ Angular MFE loaded successfully!');
  }
}
