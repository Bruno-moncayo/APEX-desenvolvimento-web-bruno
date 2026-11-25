import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Cliente } from '../model/cliente';
import { ClienteService } from '../service/cliente-service';

@Component({
  imports: [FormsModule],
  selector: 'app-login',
  styleUrl: './login.css',
  templateUrl: './login.html',
})
export class Login {
  private clienteService = inject(ClienteService);
  private router = inject(Router);

  obj: Cliente = new Cliente();
  mensagem = signal('');

  fazerLogin() {
    this.mensagem.set('');
    this.clienteService.login(this.obj.email, this.obj.senha).subscribe({
      next: cliente => {
        if (cliente.codigo > 0) {
          this.clienteService.entrar(cliente);
          this.router.navigate(['/vitrine']);
        } else {
          this.mensagem.set('Informações invalidas.');
        }
      },
      error: () => this.mensagem.set('Não foi possível realizar o login, verifique a conexão')
    });
  }
}
