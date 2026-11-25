import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { switchMap } from 'rxjs';
import { Cliente } from '../model/cliente';
import { ClienteService } from '../service/cliente-service';

@Component({
  imports: [FormsModule],
  selector: 'app-perfil',
  styleUrl: './perfil.css',
  templateUrl: './perfil.html',
})
export class Perfil implements OnInit {
  private clienteService = inject(ClienteService);
  private router = inject(Router);

  obj: Cliente = new Cliente();
  mensagem = signal('');
  erro = signal('');
  pronto = signal(false);

  
  senhaAtual = '';
  novaSenha = '';
  mensagemSenha = signal('');
  erroSenha = signal('');

  private senha = '';

  ngOnInit() {
    const logado = this.clienteService.logado();
    if (!logado) {
      this.router.navigate(['/login']);
      return;
    }

    this.obj = { ...logado };

    
    this.clienteService.buscar(logado.codigo).subscribe({
      next: cliente => {
        if (cliente.codigo > 0) {
          this.senha = cliente.senha;
          this.obj = { ...cliente, senha: '' };
          this.pronto.set(true);
        } else {
          this.erro.set('Cadastro não encontrado. Faça login de novamente.');
        }
      },
      error: () => this.erro.set('Não foi possível carregar os dados. Verifique a conexão')
    });
  }

  
  salvar() {
    this.mensagem.set('');
    this.erro.set('');

    if (!(this.obj.nome ?? '').trim() || !(this.obj.email ?? '').includes('@')) {
      this.erro.set('Preencha o nome de usuário e o e-mail');
      return;
    }

    this.clienteService.alterar({ ...this.obj, senha: this.senha }).subscribe({
      next: resposta => {
        if (resposta.includes('sucesso')) {
          this.clienteService.entrar(this.obj);
          this.mensagem.set('Dados salvos com sucesso!');
        } else {
          this.erro.set('Não foi possível salvar: ' + resposta);
        }
      },
      error: () => this.erro.set('Não foi possível salvar. Verifique a conexão')
    });
  }

  
  alterarSenha() {
    this.mensagemSenha.set('');
    this.erroSenha.set('');
    const logado = this.clienteService.logado();
    if (!logado) return;

    if (!this.senhaAtual || !this.novaSenha) {
      this.erroSenha.set('Preencha a senha atual e a nova senha.');
      return;
    }

    this.clienteService.alterarSenha(logado.email, this.senhaAtual, this.novaSenha).pipe(
      switchMap(() => this.clienteService.login(logado.email, this.novaSenha))
    ).subscribe({
      next: confirmado => {
        if (confirmado.codigo > 0) {
          this.senha = this.novaSenha;
          this.senhaAtual = '';
          this.novaSenha = '';
          this.mensagemSenha.set('Senha alterada com sucesso!');
        } else {
          this.erroSenha.set('Senha incorreta.');
        }
      },
      error: () => this.erroSenha.set('Não foi possível verificar os dados. Verifique a conexão')
    });
  }

  sair() {
    this.clienteService.sair();
    this.router.navigate(['/']);
  }

  remover() {
    this.mensagem.set('');
    this.erro.set('');
    const cliente = this.clienteService.logado();
    if (!cliente) {
      this.erro.set('Faça login para remover a conta.');
      return;
    }
    this.clienteService.apagar(cliente.codigo).subscribe({
      next: () => {
        this.clienteService.sair();
        this.router.navigate(['/']);
      },
      error: () => this.erro.set('Não foi possível remover a conta.')
    });
  }
}
