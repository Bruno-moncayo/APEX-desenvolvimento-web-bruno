import { Component, OnInit, inject } from '@angular/core';
import { ItemCesta } from '../model/item-cesta';
import { CestaService } from '../service/cesta-service';

@Component({
  selector: 'app-cesta',
  imports: [],
  templateUrl: './cesta.html',
  styleUrl: './cesta.css',
})
export class Cesta implements OnInit {
  private cestaService = inject(CestaService);

  itens: ItemCesta[] = [];

  ngOnInit(): void {
    this.itens = this.cestaService.itens();
  }

  aumentar(item: ItemCesta): void {
    this.cestaService.aumentar(item.produto.codigo);
    this.itens = this.cestaService.itens();
  }

  diminuir(item: ItemCesta): void {
    this.cestaService.diminuir(item.produto.codigo);
    this.itens = this.cestaService.itens();
  }

  remover(item: ItemCesta): void {
    this.cestaService.remover(item.produto.codigo);
    this.itens = this.cestaService.itens();
  }

  
  preco(item: ItemCesta): number {
    return ItemCesta.preco(item.produto);
  }

  total(): number {
    return this.cestaService.total(this.itens);
  }
}
