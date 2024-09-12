import { Controller, Post, Get } from '@nestjs/common';
import { CatalogoService } from './catalogo.service';
import { Catalogo } from './catalogo.entity';

@Controller('catalogo')
export class CatalogoController {
  constructor(private readonly catalogoService: CatalogoService) {}

  @Post('add')
  async addCatalogo() {
    return await this.catalogoService.addCatalogo();
  }

  @Get('all')
  async getAllCatalogo(): Promise<Catalogo[]> {
    return this.catalogoService.getAllCatalogo();
  }
}
