
  import { Routes, RouterModule } from '@angular/router';
  import { NgModule } from '@angular/core';

  // componentes
  import { LoginComponent } from './login/login.component';
  import { RegisterComponent } from './register/register.component';
  import { NoFoundComponent } from './no-found/no-found.component';

  // guards
  import { SalirUserGuard } from './services/guards/logueado.guard.service';
  import { ComprobarRenovarTokenUsuario } from './services/guards/renovarToken.guards.service';

  const router : Routes = [
    { path : 'login', component : LoginComponent },
    { path : 'register', component : RegisterComponent },

    { path : '', pathMatch : 'full', redirectTo : 'login' },

    // cargar modulo de pages dinamicamente (lazy loading)
    { path : '', loadChildren : () =>
      import('./pages/pages.module').then(m => m.PagesModule),
      canActivateChild : [SalirUserGuard, ComprobarRenovarTokenUsuario]
    },

    { path : '**', component : NoFoundComponent }
  ];

  @NgModule({
    imports : [RouterModule.forRoot(router)],
    exports : [RouterModule]
  })

  export class RoutingApp {}
