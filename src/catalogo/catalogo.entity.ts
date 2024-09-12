import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('catalogo')
export class Catalogo {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 200 })
  clave: string;

  @Column({ type: 'text' })
  descripcion: string;

  @Column({ type: 'varchar', length: 10 })
  unidad: string;

  @Column({ type: 'varchar', length: 10 })
  cantidad: string;

  @Column({ type: 'varchar', length: 10 })
  precioUnitario: string;

  @Column({ type: 'varchar', length: 10 })
  metro: string;

  @Column({ type: 'varchar', length: 10 })
  periferia: string;

  @Column({ type: 'varchar', length: 10 })
  areaMetro: string;

  @Column({ type: 'varchar', length: 10 })
  precio1: string;

  @Column({ type: 'varchar', length: 10 })
  precio2: string;

  @Column({ type: 'varchar', length: 10 })
  precio3: string;

  @Column({ type: 'varchar', length: 10 })
  precio4: string;
}
