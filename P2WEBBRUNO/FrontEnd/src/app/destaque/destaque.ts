import { Component, OnInit, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Produto } from '../model/produto';
import { ProdutoService } from '../service/produto-service';
import { CestaService } from '../service/cesta-service';

@Component({
  imports: [RouterLink],
  selector: 'app-destaque',
  styleUrl: './destaque.css',
  templateUrl: './destaque.html',
})
export class Destaque implements OnInit {
  private produtoService = inject(ProdutoService);
  private cestaService = inject(CestaService);
  private router = inject(Router);

  lista = signal<Produto[]>([]);
  erro = signal('');

  ngOnInit() {
    this.produtoService.vitrine().subscribe({
      next: produtos => this.lista.set(produtos),
      error: () => this.erro.set('Não foi possível carregar os produtos. Verifique a conexão')
    });
  }

  adicionarItem(obj: Produto) {
    this.cestaService.adicionar(obj);
    this.router.navigate(['/cesta']);
  }
}
