import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Catalogo } from './catalogo.entity';
import { dataForDB } from 'src/assets/santanderData1';

@Injectable()
export class CatalogoService {
  constructor(
    @InjectRepository(Catalogo)
    private readonly catalogoRepository: Repository<Catalogo>,
  ) {}

  async resetCatalogo(): Promise<void> {
    await this.catalogoRepository.clear();
  }
  

  async addCatalogo(): Promise<Catalogo[]> {

    await this.resetCatalogo();

    const newCatalogos = dataForDB.map((res) => {
      const data = {
        ...res,
        cantidad: res.cantidad.toFixed(2),
        precioUnitario: res.precioUnitario.toFixed(2),
        metro: res.metro.toFixed(2),
        periferia: res.periferia.toFixed(2),
        precio1: res.precio1.toFixed(2),
        precio2: res.precio2.toFixed(2),
        precio3: res.precio3.toFixed(2),
        precio4: res.precio4.toFixed(2),
      }
      return data
    });

    console.log('--- newCatalogos', newCatalogos);
    
    
    const createRepository = this.catalogoRepository.create(newCatalogos);

    console.log('--- createRepository', createRepository);

    return await this.catalogoRepository.save(createRepository);
  }

  async getAllCatalogo(): Promise<Catalogo[]> {
    return this.catalogoRepository.find();
  }

  async fixDecimals(number){
    return (Math.round(number * 100) / 100).toFixed(2)
  }
}
