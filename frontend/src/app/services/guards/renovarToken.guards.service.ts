
  import { Injectable } from '@angular/core';
  import { CanActivateChild, Router } from '@angular/router';
  import { UsuarioService } from '../usuario.service';
  import { UsuarioModelo } from '../../models/usuario';

  @Injectable({
    providedIn : 'root'
  })

  export class ComprobarRenovarTokenUsuario implements CanActivateChild {

    private token : string;

    constructor(private _usuarioService : UsuarioService, private router : Router){
      this.token = _usuarioService.retornarToken();
    }

    async canActivateChild() {

      if(this.token.length > 1){

        let payload : {exp : number, iat : number, usuario : UsuarioModelo} = JSON.parse(atob(this.token.split('.')[1]));
        let tokenExpirado = await this.expirado(payload.exp);

        if(tokenExpirado){
            localStorage.removeItem('token');
            this.router.navigateByUrl('/login');
            return false;
        }
        else {return this.verificaRenueva(payload.exp)}
      }

    };

    // comprobar si el token ya expiro
    async expirado(fechaExp : number) {
      const ahora = new Date().getTime() / 1000;
      if(fechaExp < ahora) return true
      else return false;
    };

    // metodo para renovar un token que este proximo a expirar
    verificaRenueva(fechaExp : number): Promise<boolean> | boolean {
      return new Promise((resolve, reject) => {

        let tokenExp = new Date(fechaExp * 1000);
        let ahora = new Date();
        ahora.setTime(ahora.getTime() + (1 * 60 * 60 * 1000));

        if(tokenExp.getTime() > ahora.getTime()) resolve(true);
        else {
          this._usuarioService.generarToken().subscribe(
            (response:string) => {
              localStorage.setItem('token', response);
              resolve(true);
            },
            error => {
              localStorage.removeItem('token');
              this.router.navigateByUrl('/login');
              reject(false);
            });
          }

      });
    };


  }
