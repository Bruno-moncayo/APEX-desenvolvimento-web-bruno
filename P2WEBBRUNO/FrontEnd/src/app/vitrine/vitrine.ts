import { Component, OnInit, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Produto } from '../model/produto';
import { ProdutoService } from '../service/produto-service';
import { CestaService } from '../service/cesta-service';

@Component({
  imports: [RouterLink],
  selector: 'app-vitrine',
  styleUrl: './vitrine.css',
  templateUrl: './vitrine.html',
})
export class Vitrine implements OnInit {
  private produtoService = inject(ProdutoService);
  private cestaService = inject(CestaService);
  private router = inject(Router);

  lista = signal<Produto[]>([]);
  erro = signal('');

  ngOnInit() {
    
    this.produtoService.listar().subscribe({
      next: produtos => this.lista.set(produtos),
      error: () => this.erro.set('Não foi possível carregar os produtos. O backend está ligado?')
    });
  }

  adicionarItem(obj: Produto) {
    this.cestaService.adicionar(obj);
    this.router.navigate(['/cesta']);
  }
}
