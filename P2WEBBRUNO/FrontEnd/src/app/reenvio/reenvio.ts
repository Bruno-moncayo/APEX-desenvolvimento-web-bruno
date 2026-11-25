import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { switchMap } from 'rxjs';
import { ClienteService } from '../service/cliente-service';

@Component({
  imports: [FormsModule],
  selector: 'app-reenvio',
  styleUrl: './reenvio.css',
  templateUrl: './reenvio.html',
})
export class Reenvio {
  private clienteService = inject(ClienteService);

  etapa = signal(1);
  email = '';
  senhaTemporaria = '';
  novaSenha = '';
  mensagem = signal('');
  erro = signal('');

  get recuperacao(): boolean {
    return this.email.includes('@');
  }

  
  reenvio() {
    this.erro.set('');
    if (!this.recuperacao) return;
    this.clienteService.resetarSenha(this.email).subscribe({
      next: () => this.etapa.set(2),
      error: () => this.erro.set('Não foi possível recuperar a senha. Verifique a conexão')
    });
  }

  trocar() {
    this.erro.set('');
    this.mensagem.set('');
    this.clienteService.alterarSenha(this.email, this.senhaTemporaria, this.novaSenha).pipe(
      switchMap(() => this.clienteService.login(this.email, this.novaSenha))
    ).subscribe({
      next: cliente => {
        if (cliente.codigo > 0) {
          this.mensagem.set('Senha alterada com sucesso! Agora é só fazer o login.');
        } else {
          this.erro.set('E-mail ou senha temporária incorretos.');
        }
      },
      error: () => this.erro.set('Não foi possível verificar os dados. Verifique a conexão')
    });
  }
}
