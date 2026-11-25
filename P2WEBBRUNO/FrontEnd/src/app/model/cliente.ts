// Mesmos campos da classe Cliente do backend (Cliente.java).
// ativo precisa ser 1, senão o login não funciona.
export class Cliente {
    codigo: number = 0;
    nome: string = "";
    email: string = "";
    senha: string = "";
    documento: string = "";
    telefone: string = "";
    logradouro: string = "";
    ativo: number = 1;
}
