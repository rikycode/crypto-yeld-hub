import { Component } from '@angular/core';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { CommonModule } from '@angular/common';
import { FooterComponent } from '../../components/footer/footer.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [NavbarComponent, FooterComponent, CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {
 stats = [
    { label: 'Crypto monitorate', value: 128 },
    { label: 'Wallet collegati', value: 4523 },
    { label: 'Rendimento medio stimato', value: '12.7%' },
  ];
}
