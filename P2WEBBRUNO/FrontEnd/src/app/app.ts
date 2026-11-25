import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Rodape } from './rodape/rodape';
import { Menu } from './menu/menu';
import { ClienteService } from './service/cliente-service';

@Component({
  imports: [RouterOutlet, Rodape, Menu],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {
  protected readonly title = signal('P1WEBBRUNO');

  clienteService = inject(ClienteService);
}