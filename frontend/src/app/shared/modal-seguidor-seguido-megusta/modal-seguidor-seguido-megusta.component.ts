import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialogRef } from '@angular/material/dialog';
import { UsuarioModelo } from '../../models/usuario';
import { environment } from '../../../environments/environment';
import { UsuarioService } from '../../services/usuario.service';
import { SeguidorSeguidoService } from '../../services/seguido-seguidor.service';

@Component({
  selector: 'app-modal-seguidor-seguido-megusta',
  templateUrl: './modal-seguidor-seguido-megusta.component.html',
  styleUrls: ['./modal-seguidor-seguido-megusta.component.css']
})
export class ModalSeguidorSeguidoMegustaComponent implements OnInit {
  public url : string;
  public dataUser : { type : string, usuario : string };
  public type : string;
  public seguidoresOrSeguidosOrMegustas : [];
  public userLogueado : UsuarioModelo;

  constructor(public dialogRef: MatDialogRef<ModalSeguidorSeguidoMegustaComponent>, private _usuarioService : UsuarioService,
              private _seguidorSeguidoService : SeguidorSeguidoService, private router : Router) {

    this.url = environment.url;
    this.dataUser = this.dialogRef._containerInstance._config.data;
    this.type = this.dataUser.type;
  }

  ngOnInit(): void {

    this.obtenerDataUsuarioLogueado();

    if(this.dataUser && this.type === 'Seguidores'){
        this.getUserSeguidores(this.dataUser.usuario);
    }
    else if(this.dataUser && this.type === 'Seguidos'){
        this.getUserSeguidos(this.dataUser.usuario);
    }
    else if(this.dataUser && this.type === 'MeGustas'){
      this.type = 'Me gustas';
      this.seguidoresOrSeguidosOrMegustas = (this.dataUser as any).usuarios;
    }

  }

  // obtener datos de usuario logueado
  obtenerDataUsuarioLogueado(){
    this._usuarioService.getUsuarioToken().subscribe(
      (response:UsuarioModelo) => this.userLogueado = response,
      error => {
        console.log(error);
      });
  };

  // metodo para obtener seguidores de un usuario
  getUserSeguidores(usuarioID : string){
    this._seguidorSeguidoService.getUsuariosSeguidores(usuarioID).subscribe(
      async (response:any) => this.seguidoresOrSeguidosOrMegustas = await response.seguidores.map(usuario => usuario.usuario_seguidor),
      error => {
        console.log(error);
      });
  };

  // obtener seguidos de usuario
  getUserSeguidos(usuarioID : string){
    this._seguidorSeguidoService.getUsuariosSeguidos(usuarioID).subscribe(
      async (response:any) => this.seguidoresOrSeguidosOrMegustas = await response.map(usuario => usuario.usuario_seguido),
      error => {
        console.log(error);
      });
  };

  // redirigir a un perfil de usuario
  redirigir(nameUsuario : string){

    if(this.userLogueado.nombre_usuario === nameUsuario){
        this.router.navigateByUrl('/perfil');
        this.dialogRef.close();
    } else {
        this.router.navigate(['/perfil', nameUsuario]);
        this.dialogRef.close();
    }
  };

}
