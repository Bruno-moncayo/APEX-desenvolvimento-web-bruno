import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  imports: [FormsModule],
  selector: 'app-barra-busca',
  styleUrl: './barra-busca.css',
  templateUrl: './barra-busca.html',
})
export class BarraBusca {
  private router = inject(Router);
  termo: string = "";

  
  buscar() {
    if (this.termo.trim() !== '') {
      this.router.navigate(['/resultado-busca'], { queryParams: { q: this.termo.trim() } });
    }
  }
}
