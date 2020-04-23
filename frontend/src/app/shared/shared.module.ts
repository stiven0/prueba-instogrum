
  import { NgModule } from '@angular/core';
  import { CommonModule } from '@angular/common';
  import { RouterModule } from '@angular/router';
  import { FormsModule } from '@angular/forms';

  // modulos
  import { AngularMaterialModule } from '../angular-material/angular-material.module';

  // componentes
  import { HeaderComponent } from './header/header.component';
  import { UsuariosRecomendadosComponent } from './usuarios-recomendados/usuarios-recomendados.component';
  import { ModalImagenComponent } from './modal-imagen/modal-imagen.component';
  import { ModalPublicacionComponent } from './modal-publicacion/modal-publicacion.component';
  import { ModalSeguidorSeguidoMegustaComponent } from './modal-seguidor-seguido-megusta/modal-seguidor-seguido-megusta.component';

  @NgModule({
    declarations : [
      HeaderComponent,
      UsuariosRecomendadosComponent,
      ModalImagenComponent,
      ModalPublicacionComponent,
      ModalSeguidorSeguidoMegustaComponent
    ],
    imports : [
      CommonModule,
      RouterModule,
      FormsModule,
      AngularMaterialModule
    ],
    exports :[
      HeaderComponent,
      UsuariosRecomendadosComponent
    ],
    entryComponents : [
      ModalImagenComponent,
      ModalPublicacionComponent,
      ModalSeguidorSeguidoMegustaComponent
    ]
  })

  export class SharedModule {}
