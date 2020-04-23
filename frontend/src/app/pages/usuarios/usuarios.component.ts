import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { UsuarioService } from '../../services/usuario.service';
import { SeguidorSeguidoService } from '../../services/seguido-seguidor.service';
import { UsuarioModelo } from '../../models/usuario';
import { environment } from '../../../environments/environment';
import { MatSnackBar } from '@angular/material/snack-bar';
import Swal from 'sweetalert2';
declare var $ : any;

@Component({
  selector: 'app-usuarios',
  templateUrl: './usuarios.component.html',
  styleUrls: ['./usuarios.component.css']
})
export class UsuariosComponent implements OnInit {
  public usuarios : UsuarioModelo[];
  public url : string;
  public dataUsuario : UsuarioModelo;
  public usuariosSeguidos : any;
  public checked : boolean;
  private desdeInicioMasSeguidos : number;
  private desdeInicioUsuariosPaginados : number;

  constructor(private _usuarioService : UsuarioService, private activated : ActivatedRoute, private router : Router,
              private _seguidoSeguidorService : SeguidorSeguidoService, private snackBar : MatSnackBar) {
    this.url = environment.url;
    this.usuarios = [];
    this.checked = false;
    this.desdeInicioMasSeguidos = 0;
    this.desdeInicioUsuariosPaginados = 0;
  }

  ngOnInit(): void {

    // llamamos metodo para info de usuario
    this.getInfoUser();

    // metodo para detectar cuando el usuario llegue hasta la parte inferior de la pantalla
    this.detectarScrolling();
  }

  changeUsers(){
    this.checked = !this.checked;

    if(this.checked){
        this.desdeInicioMasSeguidos = 0;
        this.usuarios = [];
        this.obtenerUsuariosMasSeguidos(0, 20); // obtener usuarios con seguidores

    } else {
        // usuarios paginados
        this.desdeInicioUsuariosPaginados = 0;
        this.usuarios = [];
        this.obtenerUsuarios(0, 20);
    }
  }

  // metodo para obtener todos los usuarios
  obtenerUsuarios(desde? : number, hasta? : number){
    this._usuarioService.getUsuariosPaginados(desde, hasta).subscribe(
      async (usuariosDB) => {
        let users : UsuarioModelo[] = await usuariosDB.filter((usuario:UsuarioModelo) => usuario._id != this.dataUsuario._id);
        this.usuarios.push(...users);
      },
      error => {
        console.log(error);
      })
  };

  // metodo para obtener los usuarios mas seguidos
  obtenerUsuariosMasSeguidos(desde? : number, hasta? : number, paginar? : boolean){
    this._usuarioService.getUsuariosRecomendados(desde, hasta).subscribe(
      async (response) => {
        let users : UsuarioModelo[] = await response.filter((usuario:UsuarioModelo) => usuario._id != this.dataUsuario._id);
        this.usuarios.push(...users);
      },
      error => {
        console.log(error);
      });
  };

  // obtener informacion de usuario logueado
  getInfoUser(){
    this._usuarioService.getUsuarioToken().subscribe(
      (response:any) => {
        this.dataUsuario = response;
        this.retornarSeguimientosUsuario(this.dataUsuario._id);

        // llamamos el metodo para obtener usuarios
        this.obtenerUsuarios(0, 20);
      },
      error => {
        console.log(error);
      });
  };

  // metodo para retornar usuarios seguidos por un usuario
  retornarSeguimientosUsuario(idUser : string){
    this._seguidoSeguidorService.getUsuariosSeguidos(idUser).subscribe(
      async (response:[] | any) => {
        this.usuariosSeguidos = await response.map((usuario) => usuario.usuario_seguido._id);
      },
      error => {
        console.log(error);
      });
  };

  // metodo para crear seguimiento de usuario
  seguirUsuario(id : string, name : string){
    const btnSeguir : any = document.getElementsByClassName('seguir');

    // barremos todos lo botones de seguir y agregamos el icono de load
    for(const btn in btnSeguir){
      if(btnSeguir[btn].previousElementSibling.innerText.split(' ')[0] == name){
          btnSeguir[btn].innerHTML = `<i class="fas fa-circle-notch fa-spin icono_load"></i>`;
          break;
      }
    }

    // llamamos al servicio para seguir a un usuario
    this._seguidoSeguidorService.seguirUser(id).subscribe(
      (response:{usuario:UsuarioModelo, seguimiento:boolean}) => {

        // si todo sale bien lanzamos le mensaje de notificacion
        if(response.seguimiento){
           this.retornarSeguimientosUsuario(this.dataUsuario._id);
           this.snackBar.open(`Siguiendo a ${ name } correctamente!!`, '👻', { duration : 4000 });
           this.incrementarOdisminurNumerosSeguidoresUsuario(id, 'agregar');
        }
      },
      error => {
        console.log(error);
      });
   };

   // metodo para dejar de seguir a un usuario
   dejarDeSeguir(usuario : UsuarioModelo){
     this.snackBar.dismiss();
     Swal.fire({
       title : 'Deseas dejar se seguir a ' + usuario.nombre_usuario,
       imageUrl : `${this.url}devolver-img-usuario/${usuario.imagen}`,
       imageWidth : 200,
       confirmButtonText : 'Dejar de seguir',
       cancelButtonText : 'Cancelar',
       showCancelButton : true
     })
     .then((result) => {
       if(result.value){
         this._seguidoSeguidorService.eliminarSeguimientoUser(usuario._id).subscribe(
           response => {
             if(response) {
                this.retornarSeguimientosUsuario(this.dataUsuario._id);
                this.incrementarOdisminurNumerosSeguidoresUsuario(usuario._id, 'quitar');
             }
           },
           error => {
             console.log(error);
           });
       }
     });
   };

   // llamamos al servicio que permitira incrementar o disminuir el numero de seguidores de un usuario
   incrementarOdisminurNumerosSeguidoresUsuario(idUsuario : string, type : string){
     this._usuarioService.actualizarOquitarNumeroSeguidoresUsuario(idUsuario, type).subscribe(
       response => {},
       error => console.log(error));
   };

   dirigirUsuario(name : string){
     if(name === this.dataUsuario.nombre_usuario) this.router.navigateByUrl('/perfil')
     else this.router.navigate(['/perfil', name]);
   }

   // metodo para detectar cuando el scroll llegue al final
   detectarScrolling(){
     $(window).scroll(() => {
       if($(window).scrollTop() + $(window).height() === $(document).height()){

           if(this.checked){
             this.desdeInicioMasSeguidos += 20;
             this.obtenerUsuariosMasSeguidos(this.desdeInicioMasSeguidos, 20, true)
           } else {
             this.desdeInicioUsuariosPaginados += 20;
             this.obtenerUsuarios(this.desdeInicioUsuariosPaginados, 20);
           }
       }
     });
   };

}
