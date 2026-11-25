import { Component } from '@angular/core';
import { BarraBusca } from '../barra-busca/barra-busca';

@Component({
  imports: [BarraBusca],
  selector: 'app-menu',
  styleUrl: './menu.css',
  templateUrl: './menu.html',
})
export class Menu {}
