import { Injectable } from '@angular/core';
import { Produto } from '../model/produto';
import { ItemCesta } from '../model/item-cesta';


@Injectable({ providedIn: 'root' })
export class CestaService {
  private readonly chave = 'cesta';

  itens(): ItemCesta[] {
    try {
      const json = localStorage.getItem(this.chave);
      if (!json) return [];

      const itens = JSON.parse(json) as ItemCesta[];
      return Array.isArray(itens) ? itens : [];
    } catch {
      return [];
    }
  }

  private salvar(itens: ItemCesta[]): void {
    localStorage.setItem(this.chave, JSON.stringify(itens));
  }

  adicionar(produto: Produto): void {
    if (!produto || produto.quantidade <= 0) return;

    const cesta = this.itens();
    const existente = cesta.find(
      item => item.produto.codigo === produto.codigo
    );

    if (existente) {
      
      existente.produto = produto;
      if (existente.quantidade < produto.quantidade) {
        existente.quantidade++;
      }
    } else {
      cesta.push(new ItemCesta(produto));
    }

    this.salvar(cesta);
  }

  aumentar(codigo: number): void {
    const cesta = this.itens();
    const item = cesta.find(i => i.produto.codigo === codigo);

    if (!item) return;

    const estoque = item.produto.quantidade ?? 0;
    if (item.quantidade < estoque) {
      item.quantidade++;
      this.salvar(cesta);
    }
  }

  diminuir(codigo: number): void {
    const cesta = this.itens();
    const item = cesta.find(i => i.produto.codigo === codigo);


    if (item && item.quantidade > 1) {
      item.quantidade--;
      this.salvar(cesta);
    }
  }

  remover(codigo: number): void {
    this.salvar(this.itens().filter(i => i.produto.codigo !== codigo));
  }

  esvaziar(): void {
    localStorage.removeItem(this.chave);
  }

  total(itens: ItemCesta[] = this.itens()): number {
    return itens.reduce(
      (soma, item) => soma + ItemCesta.preco(item.produto) * item.quantidade,
      0
    );
  }
}