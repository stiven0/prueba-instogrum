import { Injectable } from '@angular/core';
import { CanActivateChild, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { UsuarioService } from '../usuario.service';

@Injectable({
  providedIn : 'root'
})

export class SalirUserGuard implements CanActivateChild {

  constructor(private _usuarioService : UsuarioService, private router : Router){}

  canActivateChild(next : ActivatedRouteSnapshot, state : RouterStateSnapshot) {
      if(this._usuarioService.retornarToken().length > 1) return true;
      else {
        this.router.navigateByUrl('/')
        return false;
      }
  }

}
