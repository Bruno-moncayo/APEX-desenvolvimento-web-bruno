import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { catchError, map, of, switchMap } from 'rxjs';
import { Produto } from '../model/produto';
import { ProdutoService } from '../service/produto-service';
import { CestaService } from '../service/cesta-service';

@Component({
  imports: [RouterLink],
  selector: 'app-resultado-busca',
  styleUrl: './resultado-busca.css',
  templateUrl: './resultado-busca.html',
})
export class ResultadoBusca {
  private rota = inject(ActivatedRoute);
  private router = inject(Router);
  private produtoService = inject(ProdutoService);
  private cestaService = inject(CestaService);

  
  private termo$ = this.rota.queryParamMap.pipe(map(p => (p.get('q') ?? '').trim()));

  termo = toSignal(this.termo$, { initialValue: '' });

  
  lista = toSignal(
    this.termo$.pipe(
      switchMap(termo =>
        termo === ''
          ? of([] as Produto[])
          : this.produtoService.pesquisar(termo).pipe(catchError(() => of([] as Produto[])))
      )
    ),
    { initialValue: [] as Produto[] }
  );

  adicionarItem(obj: Produto) {
    this.cestaService.adicionar(obj);
    this.router.navigate(['/cesta']);
  }
}
