import { Service, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Cliente } from '../model/cliente';

@Service()
export class ClienteService {
  private http = inject(HttpClient);
  private url = 'http://localhost:8081/api/cliente';
  private chave = 'cliente';

  
  logado = signal<Cliente | null>(this.lerLogado());

  private lerLogado(): Cliente | null {
    try {
      const json = localStorage.getItem(this.chave);
      return json ? JSON.parse(json) : null;
    } catch {
      return null;
    }
  }

  entrar(cliente: Cliente) {
    const seguro = { ...cliente, senha: '' };
    localStorage.setItem(this.chave, JSON.stringify(seguro));
    this.logado.set(seguro);
  }

  sair() {
    localStorage.removeItem(this.chave);
    this.logado.set(null);
  }

  

  
  buscar(codigo: number): Observable<Cliente> {
    return this.http.get<Cliente>(`${this.url}/${codigo}`);
  }

  
  cadastrar(cliente: Cliente): Observable<string> {
    return this.http.post(this.url, { ...cliente, ativo: 1 }, { responseType: 'text' });
  }

  
  alterar(cliente: Cliente): Observable<string> {
    return this.http.put(this.url, cliente, { responseType: 'text' });
  }

  
  apagar(codigo: number): Observable<string> {
    return this.http.delete(`${this.url}/${codigo}`, { responseType: 'text' });
  }

  
  login(email: string, senha: string): Observable<Cliente> {
    return this.http.post<Cliente>(`${this.url}/login`, { email, senha });
  }

  
  resetarSenha(email: string): Observable<string> {
    return this.http.patch(`${this.url}/resetarSenha`, { email }, { responseType: 'text' });
  }

  
  alterarSenha(email: string, senhaAntiga: string, novaSenha: string): Observable<string> {
    return this.http.patch(`${this.url}/alterarSenha`,
      { email, documento: senhaAntiga, senha: novaSenha }, { responseType: 'text' });
  }
}
