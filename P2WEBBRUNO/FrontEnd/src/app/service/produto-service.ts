import { Service, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Produto } from '../model/produto';


@Service()
export class ProdutoService {
  private http = inject(HttpClient);
  private url = 'http://localhost:8081/api';

  
  vitrine(): Observable<Produto[]> {
    return this.http.get<Produto[]>(`${this.url}/produto/vitrine`);
  }

  
  listar(): Observable<Produto[]> {
    return this.http.get<Produto[]>(`${this.url}/produtos`);
  }

  
  buscar(codigo: number): Observable<Produto> {
    return this.http.get<Produto>(`${this.url}/produto/${codigo}`);
  }

  
  pesquisar(termo: string): Observable<Produto[]> {
    return this.http.get<Produto[]>(`${this.url}/produto/busca/${encodeURIComponent(termo)}`);
  }

  
  gravar(produto: Produto): Observable<string> {
    return this.http.post(`${this.url}/produto`, produto, { responseType: 'text' });
  }

  
  alterar(produto: Produto): Observable<string> {
    return this.http.put(`${this.url}/produto`, produto, { responseType: 'text' });
  }

  
  apagar(codigo: number): Observable<string> {
    return this.http.delete(`${this.url}/produto/${codigo}`, { responseType: 'text' });
  }
}
