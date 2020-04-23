
  import { RouterModule, Routes } from '@angular/router';
  import { NgModule } from '@angular/core';

  // pages
  import { PrincipalComponent } from './principal/principal.component';
  import { PerfilComponent } from './perfil/perfil.component';
  import { UsuariosComponent } from './usuarios/usuarios.component';
  import { PublicacionesComponent } from './publicaciones/publicaciones.component';
  import { PublicacionComponent } from './publicacion/publicacion.component';
  import { EditarPerfilComponent } from './editar-perfil/editar-perfil.component';

  // guards

  const ROUTES : Routes = [
    { path : 'principal', component : PrincipalComponent },
    { path : 'publicaciones', component : PublicacionesComponent },
    { path : 'perfil', component : PerfilComponent },
    { path : 'perfil/:name', component : PerfilComponent },
    { path : 'editar-perfil', component : EditarPerfilComponent },
    { path : 'usuarios', component : UsuariosComponent },
    { path : 'publicacion/:id', component : PublicacionComponent },
    { path : '', pathMatch : 'full', redirectTo : 'principal' }
  ];

  @NgModule({
    imports : [RouterModule.forChild(ROUTES)],
    exports : [RouterModule]
  })

  export class RoutingPages {}
