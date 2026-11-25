import { Service, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';


export interface PedidoBackend {
  codigoPedido: number;
  valorTotal: number;
  entrega: string;
  obs: string;
  dataPedido: string;
  codigoCliente: number;
}

@Service()
export class PedidoService {
  private http = inject(HttpClient);
  private url = 'http://localhost:8081/api/pedido';

  
  buscar(codigo: number): Observable<PedidoBackend> {
    return this.http.get<PedidoBackend>(`${this.url}/${codigo}`);
  }

  
  gravar(valorTotal: number, entrega: string, codigoCliente: number): Observable<string> {
    const d = new Date();
    const hoje = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const corpo = { valorTotal, entrega, obs: '', dataPedido: hoje, codigoCliente };
    return this.http.post(this.url, corpo, { responseType: 'text' });
  }

  
  alterar(pedido: PedidoBackend): Observable<string> {
    return this.http.put(this.url, pedido, { responseType: 'text' });
  }

  
  apagar(codigo: number): Observable<string> {
    return this.http.delete(`${this.url}/${codigo}`, { responseType: 'text' });
  }
}
