
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// modulos
import { SharedModule } from '../shared/shared.module';
import { AngularMaterialModule } from '../angular-material/angular-material.module';
import { PipesModule } from '../pipes/pipes.module';

// pages
import { PrincipalComponent } from './principal/principal.component';
import { PerfilComponent } from './perfil/perfil.component';
import { UsuariosComponent } from './usuarios/usuarios.component';
import { PublicacionesComponent } from './publicaciones/publicaciones.component';
import { PublicacionComponent } from './publicacion/publicacion.component';
import { EditarPerfilComponent } from './editar-perfil/editar-perfil.component';

// rutas
import { RoutingPages } from './routing.pages';

@NgModule({
  declarations : [
    PrincipalComponent,
    PerfilComponent,
    UsuariosComponent,
    PublicacionesComponent,
    PublicacionComponent,
    EditarPerfilComponent
  ],
  imports : [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    RoutingPages,
    SharedModule,
    AngularMaterialModule,
    PipesModule
  ],
})

export class PagesModule {}
