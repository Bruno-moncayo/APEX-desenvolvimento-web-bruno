import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, map, of, switchMap } from 'rxjs';
import { Produto } from '../model/produto';
import { ProdutoService } from '../service/produto-service';
import { CestaService } from '../service/cesta-service';

@Component({
  selector: 'app-detalhe',
  imports: [],
  templateUrl: './detalhe.html',
  styleUrl: './detalhe.css'
})
export class Detalhe {
  private rota = inject(ActivatedRoute);
  private router = inject(Router);
  private produtoService = inject(ProdutoService);
  private cestaService = inject(CestaService);

  
  produto = toSignal(
    this.rota.queryParamMap.pipe(
      map(p => Number(p.get('codigo'))),
      switchMap(codigo =>
        this.produtoService.buscar(codigo).pipe(catchError(() => of(undefined)))
      ),
      map(p => (p && p.codigo > 0 ? p : undefined))
    ),
    { initialValue: undefined }
  );

  adicionarItem(obj: Produto) {
    this.cestaService.adicionar(obj);
    this.router.navigate(['/cesta']);
  }
}
