// Testes que SIMULAM o backend do professor (HttpTestingController) e conferem
// quais requisições cada tela faz e o que aparece na tela depois da resposta.
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { routes } from './app.routes';
import { App } from './app';

const BASE = 'http://localhost:8081/api';
const luva = { codigo: 4, nome: 'Luva Térmica', descritivo: 'Luva pra chuva', valor: 49.9, valorPromo: 39.9, quantidade: 25, destaque: 1 };
const capa = { codigo: 7, nome: 'Capa de Chuva', descritivo: 'Capa', valor: 119.9, valorPromo: 0, quantidade: 10, destaque: 1 };
const semEstoque = { ...capa, codigo: 8, nome: 'Bota', quantidade: 0 };
const ana = { codigo: 3, nome: 'Ana', email: 'ana@email.com', senha: '', documento: '', telefone: '', logradouro: 'Rua A, 10', ativo: 1 };

describe('conexão com o backend', () => {
  let http: HttpTestingController;
  let harness: RouterTestingHarness;

  const texto = () => (harness.routeNativeElement as HTMLElement).textContent!.replace(/\s+/g, ' ');
  const el = () => harness.routeNativeElement as HTMLElement;
  const depois = async () => { await harness.fixture.whenStable(); harness.detectChanges(); };
  const digitar = (seletor: string, valor: string) => {
    const i = el().querySelector(seletor) as HTMLInputElement;
    i.value = valor; i.dispatchEvent(new Event('input'));
  };
  const cesta = (itens: any[]) => localStorage.setItem('cesta', JSON.stringify(itens));
  const item = (produto: any, quantidade: number) => ({ produto, quantidade, valor: 0 });

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter(routes)],
    });
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify());

  const abrir = async (url: string) => { harness = await RouterTestingHarness.create(); await harness.navigateByUrl(url); };

  // ------------------------------------------------------------ produtos
  it('vitrine: GET /produto/vitrine, desenha os cards e "Comprar" só com estoque', async () => {
    await abrir('/vitrine');
    http.expectOne(`${BASE}/produto/vitrine`).flush([luva, capa, semEstoque]);
    await depois();
    expect(el().querySelectorAll('.card').length).toBe(3);
    expect(texto()).toContain('39,90');
    expect(el().querySelectorAll('button').length).toBe(2);      // a "Bota" (estoque 0) não tem Comprar
    expect(el().querySelector('a[href*="detalhe"]')!.getAttribute('href')).toContain('codigo=4');
  });

  it('vitrine: mostra erro com o backend desligado', async () => {
    await abrir('/vitrine');
    http.expectOne(`${BASE}/produto/vitrine`).error(new ProgressEvent('error'));
    await depois();
    expect(texto()).toContain('backend está ligado');
  });

  it('vitrine: Comprar põe na cesta (localStorage) e vai para /cesta; o 2º clique soma, até o limite do estoque', async () => {
    await abrir('/vitrine');
    http.expectOne(`${BASE}/produto/vitrine`).flush([{ ...capa, quantidade: 2 }]);
    await depois();
    const router = TestBed.inject(Router);
    for (let i = 0; i < 3; i++) {
      await router.navigateByUrl('/vitrine'); await depois();
      http.match(`${BASE}/produto/vitrine`).forEach(r => r.flush([{ ...capa, quantidade: 2 }]));
      await depois();
      (el().querySelector('button') as HTMLButtonElement).click();
      await depois();
    }
    http.match(() => true);
    const guardada = JSON.parse(localStorage.getItem('cesta')!);
    expect(guardada.length).toBe(1);
    expect(guardada[0].quantidade).toBe(2);                       // parou no estoque (2), não foi a 3
    expect(router.url).toBe('/cesta');
  });

  it('detalhe: /detalhe?codigo=4 -> GET /produto/4 (com promoção e economia)', async () => {
    await abrir('/detalhe?codigo=4');
    http.expectOne(`${BASE}/produto/4`).flush(luva);
    await depois();
    expect(texto()).toContain('Luva Térmica');
    expect(texto()).toContain('Você economiza R$ 10,00');
  });

  it('detalhe: sem promoção mostra só o valor normal', async () => {
    await abrir('/detalhe?codigo=7');
    http.expectOne(`${BASE}/produto/7`).flush(capa);
    await depois();
    expect(texto()).toContain('R$ 119,90');
    expect(texto()).not.toContain('economiza');
  });

  it('detalhe: produto inexistente (codigo 0) -> "não encontrado"', async () => {
    await abrir('/detalhe?codigo=99');
    http.expectOne(`${BASE}/produto/99`).flush({ ...luva, codigo: 0 });
    await depois();
    expect(texto()).toContain('Produto não encontrado');
  });

  // ------------------------------------------------------------ busca + menu
  it('barra de busca: digitar + Enter vai para /resultado-busca?q= e busca no backend', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const input = (fixture.nativeElement as HTMLElement).querySelector('input[name="txtBusca"]') as HTMLInputElement;
    input.value = '  luva  '; input.dispatchEvent(new Event('input'));
    input.dispatchEvent(new KeyboardEvent('keyup', { key: 'Enter' }));
    await fixture.whenStable();
    const router = TestBed.inject(Router);
    expect(router.url).toBe('/resultado-busca?q=luva');
    http.expectOne(`${BASE}/produto/busca/luva`).flush([luva]);
    await fixture.whenStable(); fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Resultados para "luva"');
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Luva Térmica');
  });

  it('resultado-busca: sem resultado mostra aviso', async () => {
    await abrir('/resultado-busca?q=xyz');
    http.expectOne(`${BASE}/produto/busca/xyz`).flush([]);
    await depois();
    expect(texto()).toContain('Nenhum produto encontrado');
  });

  it('menu: logado mostra "Olá" e "Sair"; Sair limpa o localStorage', async () => {
    localStorage.setItem('cliente', JSON.stringify(ana));
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable(); fixture.detectChanges();
    const e = fixture.nativeElement as HTMLElement;
    expect(e.textContent).toContain('Olá, Ana');
    expect(e.textContent).not.toContain('Login');
    [...e.querySelectorAll('button')].find(b => b.textContent!.includes('Sair'))!.click();
    await fixture.whenStable(); fixture.detectChanges();
    http.match(() => true).forEach(r => r.flush([]));
    expect(localStorage.getItem('cliente')).toBeNull();
    expect(e.textContent).toContain('Login');
  });

  // ------------------------------------------------------------ login / cadastro / senha
  it('login: POST /cliente/login; certo -> guarda o cliente SEM a senha e vai para a vitrine', async () => {
    await abrir('/login');
    digitar('#email', 'ana@email.com'); digitar('#senha', '123456');
    (el().querySelector('button.btn-danger') as HTMLButtonElement).click();
    const req = http.expectOne(`${BASE}/cliente/login`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ email: 'ana@email.com', senha: '123456' });
    req.flush({ ...ana, senha: '123456' });
    await depois();
    expect(TestBed.inject(Router).url).toBe('/vitrine');
    const guardado = JSON.parse(localStorage.getItem('cliente')!);
    expect(guardado.nome).toBe('Ana');
    expect(guardado.senha).toBe('');
    http.expectOne(`${BASE}/produto/vitrine`).flush([]);
  });

  it('login: senha errada (cliente com codigo 0) mostra mensagem e não guarda nada', async () => {
    await abrir('/login');
    digitar('#email', 'ana@email.com'); digitar('#senha', 'errada');
    (el().querySelector('button.btn-danger') as HTMLButtonElement).click();
    http.expectOne(`${BASE}/cliente/login`).flush({ ...ana, codigo: 0, nome: null });
    await depois();
    expect(texto()).toContain('E-mail ou senha inválidos');
    expect(localStorage.getItem('cliente')).toBeNull();
  });

  it('login: backend desligado mostra mensagem', async () => {
    await abrir('/login');
    (el().querySelector('button.btn-danger') as HTMLButtonElement).click();
    http.expectOne(`${BASE}/cliente/login`).error(new ProgressEvent('error'));
    await depois();
    expect(texto()).toContain('backend está ligado');
  });

  it('cadastro: POST /cliente com ativo = 1 e mensagem de sucesso', async () => {
    await abrir('/cadastro');
    digitar('#usuario', 'Bruno'); digitar('#email', 'b@email.com'); digitar('input[name="senha"]', 'abc123');
    (el().querySelector('button.btn-danger') as HTMLButtonElement).click();
    const req = http.expectOne(`${BASE}/cliente`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body.nome).toBe('Bruno');
    expect(req.request.body.email).toBe('b@email.com');
    expect(req.request.body.senha).toBe('abc123');
    expect(req.request.body.ativo).toBe(1);
    req.flush('Cliente gravado com sucesso! 4');
    await depois();
    expect(texto()).toContain('Cadastro realizado');
  });

  it('cadastro: campos vazios não chamam o backend', async () => {
    await abrir('/cadastro');
    (el().querySelector('button.btn-danger') as HTMLButtonElement).click();
    await depois();
    http.expectNone(`${BASE}/cliente`);
    expect(texto()).toContain('Preencha nome, e-mail e senha');
  });

  it('cadastro: alterarSenha() -> PATCH com a senha antiga em "documento" e confirma por login', async () => {
    localStorage.setItem('cliente', JSON.stringify(ana));
    await abrir('/cadastro');
    const comp: any = harness.routeDebugElement!.componentInstance;
    comp.senhaAtual = 'velha'; comp.novaSenha = 'nova';
    comp.alterarSenha();
    const patch = http.expectOne(`${BASE}/cliente/alterarSenha`);
    expect(patch.request.method).toBe('PATCH');
    expect(patch.request.body).toEqual({ email: 'ana@email.com', documento: 'velha', senha: 'nova' });
    patch.flush('Sua senha foi alterada, verifique o seu email!');
    const login = http.expectOne(`${BASE}/cliente/login`);
    expect(login.request.body).toEqual({ email: 'ana@email.com', senha: 'nova' });
    login.flush({ ...ana });
    await depois();
    expect(texto()).toContain('Senha alterada com sucesso');
  });

  it('cadastro: remover() -> DELETE /cliente/3, desloga e volta para a vitrine', async () => {
    localStorage.setItem('cliente', JSON.stringify(ana));
    await abrir('/cadastro');
    (harness.routeDebugElement!.componentInstance as any).remover();
    const del = http.expectOne(`${BASE}/cliente/3`);
    expect(del.request.method).toBe('DELETE');
    del.flush('Cliente removido com sucesso!');
    await depois();
    expect(localStorage.getItem('cliente')).toBeNull();
    expect(TestBed.inject(Router).url).toBe('/');
    http.expectOne(`${BASE}/produto/vitrine`).flush([]);
  });

  it('reenvio: etapa 1 PATCH resetarSenha; etapa 2 PATCH alterarSenha + login de confirmação', async () => {
    await abrir('/reenvio');
    digitar('#email', 'ana@email.com');
    await depois();
    (el().querySelector('button.btn-danger') as HTMLButtonElement).click();
    const reset = http.expectOne(`${BASE}/cliente/resetarSenha`);
    expect(reset.request.method).toBe('PATCH');
    expect(reset.request.body).toEqual({ email: 'ana@email.com' });
    reset.flush('Sua senha foi reiniciada, verifique o seu email!');
    await depois();
    expect(texto()).toContain('Senha1234');

    digitar('#temporaria', 'Senha1234'); digitar('#nova', 'minhaNova');
    await depois();
    (el().querySelector('button.btn-danger') as HTMLButtonElement).click();
    const troca = http.expectOne(`${BASE}/cliente/alterarSenha`);
    expect(troca.request.body).toEqual({ email: 'ana@email.com', documento: 'Senha1234', senha: 'minhaNova' });
    troca.flush('ok');
    http.expectOne(`${BASE}/cliente/login`).flush(ana);
    await depois();
    expect(texto()).toContain('Senha alterada com sucesso');
  });

  it('reenvio: senha temporária errada (login volta codigo 0) mostra erro', async () => {
    await abrir('/reenvio');
    digitar('#email', 'ana@email.com'); await depois();
    (el().querySelector('button.btn-danger') as HTMLButtonElement).click();
    http.expectOne(`${BASE}/cliente/resetarSenha`).flush('ok'); await depois();
    digitar('#temporaria', 'errada'); digitar('#nova', 'x'); await depois();
    (el().querySelector('button.btn-danger') as HTMLButtonElement).click();
    http.expectOne(`${BASE}/cliente/alterarSenha`).flush('ok');
    http.expectOne(`${BASE}/cliente/login`).flush({ ...ana, codigo: 0 });
    await depois();
    expect(texto()).toContain('incorretos');
  });

  // ------------------------------------------------------------ cesta
  it('cesta: lê do localStorage, usa promoção quando existe, soma o total e remove', async () => {
    cesta([item(luva, 2), item(capa, 1)]);       // luva: promo 39,90 x2 = 79,80 | capa sem promo: 119,90
    await abrir('/cesta');
    expect(texto()).toContain('Luva Térmica');
    expect(texto()).toContain('R$ 79,80');
    expect(texto()).toContain('R$ 119,90');
    expect(texto()).toContain('R$ 199,70');       // total
    [...el().querySelectorAll('button')].find(b => b.textContent!.includes('Remover'))!.click();
    await depois();
    expect(texto()).not.toContain('Luva Térmica');
    expect(JSON.parse(localStorage.getItem('cesta')!).length).toBe(1);   // a remoção foi salva
  });

  it('cesta vazia mostra aviso', async () => {
    await abrir('/cesta');
    expect(texto()).toContain('Sua cesta está vazia');
  });

  // ------------------------------------------------------------ pedido
  it('pedido: sem login não chama o backend', async () => {
    cesta([item(luva, 1)]);
    await abrir('/pedido');
    expect(texto()).toContain('Faça login');
  });

  it('pedido: cesta vazia não chama o backend', async () => {
    localStorage.setItem('cliente', JSON.stringify(ana));
    await abrir('/pedido');
    expect(texto()).toContain('Sua cesta está vazia');
  });

  it('pedido: grava o pedido e baixa o estoque UM produto de cada vez (sem paralelo)', async () => {
    localStorage.setItem('cliente', JSON.stringify(ana));
    cesta([item(luva, 2), item(capa, 1)]);
    await abrir('/pedido');

    const post = http.expectOne(`${BASE}/pedido`);
    expect(post.request.method).toBe('POST');
    expect(post.request.body.valorTotal).toBeCloseTo(199.7, 2);
    expect(post.request.body.codigoCliente).toBe(3);
    expect(post.request.body.entrega).toBe('Rua A, 10');
    expect(post.request.body.dataPedido).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    post.flush('Cliente gravado com sucesso! 5');

    // 1º produto: busca o atual (GET) e só depois grava (PUT). O 2º ainda NÃO pode ter saído.
    http.expectOne(`${BASE}/produto/4`).flush({ ...luva });
    http.expectNone(`${BASE}/produto/7`);
    const put1 = http.expectOne(r => r.method === 'PUT' && r.url === `${BASE}/produto`);
    expect(put1.request.body.codigo).toBe(4);
    expect(put1.request.body.quantidade).toBe(23);               // 25 - 2
    http.expectNone(`${BASE}/produto/7`);                         // continua esperando o PUT terminar
    put1.flush('Produto alterado com sucesso!');

    http.expectOne(`${BASE}/produto/7`).flush({ ...capa });
    const put2 = http.expectOne(r => r.method === 'PUT' && r.url === `${BASE}/produto`);
    expect(put2.request.body.codigo).toBe(7);
    expect(put2.request.body.quantidade).toBe(9);                // 10 - 1
    put2.flush('Produto alterado com sucesso!');

    await depois();
    expect(texto()).toContain('Sua compra foi finalizada');
    expect(texto()).toContain('Pedido nº 5');
    expect(localStorage.getItem('cesta')).toBeNull();            // cesta esvaziada
  });

  it('pedido: o estoque nunca fica negativo', async () => {
    localStorage.setItem('cliente', JSON.stringify(ana));
    cesta([item(luva, 5)]);
    await abrir('/pedido');
    http.expectOne(`${BASE}/pedido`).flush('ok 1');
    http.expectOne(`${BASE}/produto/4`).flush({ ...luva, quantidade: 3 });   // alguém já comprou antes
    const put = http.expectOne(r => r.method === 'PUT');
    expect(put.request.body.quantidade).toBe(0);
    put.flush('ok');
  });

  it('pedido: se o estoque falhar, o pedido continua gravado e aparece um aviso', async () => {
    localStorage.setItem('cliente', JSON.stringify(ana));
    cesta([item(luva, 1)]);
    await abrir('/pedido');
    http.expectOne(`${BASE}/pedido`).flush('Cliente gravado com sucesso! 8');
    http.expectOne(`${BASE}/produto/4`).flush({ ...luva });
    http.expectOne(r => r.method === 'PUT').flush('erro', { status: 500, statusText: 'Internal Server Error' });
    await depois();
    expect(texto()).toContain('Sua compra foi finalizada');
    expect(texto()).toContain('não foi possível atualizar o estoque');
    expect(localStorage.getItem('cesta')).toBeNull();
  });

  it('pedido: se o POST do pedido falhar, mostra erro e MANTÉM a cesta', async () => {
    localStorage.setItem('cliente', JSON.stringify(ana));
    cesta([item(luva, 1)]);
    await abrir('/pedido');
    http.expectOne(`${BASE}/pedido`).error(new ProgressEvent('error'));
    await depois();
    expect(texto()).toContain('Não foi possível finalizar');
    expect(localStorage.getItem('cesta')).not.toBeNull();
  });
});
