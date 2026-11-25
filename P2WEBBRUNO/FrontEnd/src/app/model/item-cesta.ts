import { Produto } from "./produto";

export class ItemCesta {

    produto: Produto = new Produto();
    quantidade: number = 1;
    valor: number = 0;

    constructor(obj: Produto) {
        this.produto = obj;
        this.valor = ItemCesta.preco(obj);
    }

    
    static preco(produto: Produto): number {
        return produto.valorPromo > 0 ? produto.valorPromo : produto.valor;
    }
}
