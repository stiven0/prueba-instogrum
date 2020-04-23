
  import { NgModule } from '@angular/core';

  // servicios
  import { SalirUserGuard } from './guards/logueado.guard.service'
  import { ComprobarRenovarTokenUsuario } from './guards/renovarToken.guards.service';
  import { UsuarioService } from './usuario.service';
  import { PublicacionService } from './publicacion.service';
  import { SeguidorSeguidoService } from './seguido-seguidor.service';

  @NgModule({

    providers : [
      SalirUserGuard,
      UsuarioService,
      PublicacionService,
      SeguidorSeguidoService,
      ComprobarRenovarTokenUsuario
    ]

  })

  export class ServicesModule {}
