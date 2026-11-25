import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { BarraBusca } from './barra-busca';

describe('BarraBusca', () => {
  let component: BarraBusca;
  let fixture: ComponentFixture<BarraBusca>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BarraBusca],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(BarraBusca);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
