import { Repository, DataSource } from 'typeorm';
import { Email } from './email.entity';

export class EmailRepository extends Repository<Email> {
  constructor(dataSource: DataSource) {
    super(Email, dataSource.createEntityManager());
  }

  // Aquí puedes agregar métodos personalizados para el repositorio si los necesitas.
}
