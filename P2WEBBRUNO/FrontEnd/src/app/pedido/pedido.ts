import { Component, OnInit, inject, signal } from '@angular/core';
import { concatMap, from, toArray } from 'rxjs';
import { ItemCesta } from '../model/item-cesta';
import { ClienteService } from '../service/cliente-service';
import { CestaService } from '../service/cesta-service';
import { PedidoService } from '../service/pedido-service';
import { ProdutoService } from '../service/produto-service';

@Component({
  imports: [],
  selector: 'app-pedido',
  styleUrl: './pedido.css',
  templateUrl: './pedido.html',
})
export class Pedido implements OnInit {
  private clienteService = inject(ClienteService);
  private cestaService = inject(CestaService);
  private pedidoService = inject(PedidoService);
  private produtoService = inject(ProdutoService);

  estado = signal<'processando' | 'ok' | 'semLogin' | 'vazia' | 'erro'>('processando');
  numero = signal(0);
  aviso = signal('');

  
  ngOnInit() {
    const cliente = this.clienteService.logado();
    if (!cliente) {
      this.estado.set('semLogin');
      return;
    }
    const itens = this.cestaService.itens();
    if (itens.length === 0) {
      this.estado.set('vazia');
      return;
    }

    const total = this.cestaService.total(itens);
    this.pedidoService.gravar(total, cliente.logradouro ?? '', cliente.codigo).subscribe({
      next: texto => {
        this.numero.set(Number(/(\d+)\s*$/.exec(texto)?.[1] ?? 0));
        this.cestaService.esvaziar();
        this.baixarEstoque(itens);
      },
      error: () => {
        this.aviso.set('Não foi possível salvar o pedido, verifique a conexão');
        this.estado.set('erro');
      }
    });
  }

  
  private baixarEstoque(itens: ItemCesta[]) {
    from(itens).pipe(
      concatMap(item =>
        this.produtoService.buscar(item.produto.codigo).pipe(
          concatMap(atual => {
            atual.quantidade = Math.max(0, atual.quantidade - item.quantidade);
            return this.produtoService.alterar(atual);
          })
        )
      ),
      toArray()
    ).subscribe({
      next: () => this.estado.set('ok'),
      error: () => {
        this.aviso.set('Pedido gravado, Houve falha ao atualizar o estoque dos produtos.');
        this.estado.set('ok');
      }
    });
  }
}
