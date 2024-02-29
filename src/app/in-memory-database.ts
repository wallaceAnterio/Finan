import { InMemoryDbService, RequestInfo } from 'angular-in-memory-web-api';
import { Observable } from 'rxjs';

export class InMemoryDataBase implements InMemoryDbService {
    createDb(
        reqInfo?: RequestInfo | undefined
    ): {} | Observable<{}> | Promise<{}> {
        const categories = [
            { id: 1, name: 'Moradia', description: 'Pagamentos de Contas' },
            { id: 2, name: 'Saúde', description: 'Plano de saúde' },
            { id: 3, name: 'Lazer', description: 'Cinema, Parque, praia' },
            { id: 4, name: 'Salário', description: 'pagamento' },
            { id: 5, name: 'Freelas', description: 'Trabalhos com freelancer' },
        ];
        return { categories };
    }
}
