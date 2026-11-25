import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Cliente } from '../model/cliente';
import { ClienteService } from '../service/cliente-service';

@Component({
  imports: [FormsModule],
  selector: 'app-cadastro',
  styleUrl: './cadastro.css',
  templateUrl: './cadastro.html',
})
export class Cadastro {
  private clienteService = inject(ClienteService);

  obj: Cliente = new Cliente();
  mensagem = signal('');
  erro = signal('');


  gravar() {
    this.mensagem.set('');
    this.erro.set('');
    
    if (!this.obj.nome || !this.obj.email || !this.obj.senha) {
      this.erro.set('Preencha as informações');
      return;
    }
    if (!this.obj.email.includes('@')) {
      this.erro.set('Informe um e-mail válido.');
      return;
    }
    this.clienteService.cadastrar(this.obj).subscribe({
      next: () => {
        this.mensagem.set('Cadastro realizado, por favor, prossiga ao login!');
        this.obj = new Cliente();
      },
      error: () => this.erro.set('Não foi possível realizar o cadastro. Verifique a conexão')
    });
  }

}
