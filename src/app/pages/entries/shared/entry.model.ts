import { Category } from '../../categories/shared/category.model';

export class Entry {
  id?: number;
  name?: string;
  description?: string;
  type?: string;
  amount?: string;
  date?: string;
  paid?: boolean;
  categoryId?: number;
  category?: Category;

  static types = {
    expense: 'Despesa',
    revenue: 'Receita',
  };

  get paidText(): string {
    return this.paid ? 'Pago' : 'Pendente';
  }
}
