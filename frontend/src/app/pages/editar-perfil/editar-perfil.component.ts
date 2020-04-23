import { Component, OnInit } from '@angular/core';
import { UsuarioService } from '../../services/usuario.service';
import { Router } from '@angular/router';
import { UsuarioModelo } from '../../models/usuario';
import { NgForm, FormGroup, FormControl, Validators } from '@angular/forms';
import { environment } from '../../../environments/environment';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-editar-perfil',
  templateUrl: './editar-perfil.component.html',
  styleUrls: ['./editar-perfil.component.css']
})
export class EditarPerfilComponent implements OnInit {
  public url : string;
  public dataUsuario : UsuarioModelo;
  public errorForm : string;
  public loading : boolean;
  public formPasswords : FormGroup;
  public errorPasswordActual : boolean;
  public errorEmailExist : boolean | any;
  private changeTextArea : boolean;

  constructor(private _usuarioService : UsuarioService, private router : Router) {
    this.url = environment.url;
    this.loading = false;
    this.errorPasswordActual = false;
    this.changeTextArea = false;
    this.errorEmailExist = false;

    // formulario para cambio de contraseña
    this.formPasswords = new FormGroup({
      passwordActual : new FormControl(null, [Validators.pattern(/^(?=\w*\d)(?=\w*)(?=\w*[a-z])\S{4,16}$/), Validators.required]),
      passwordNuevo : new FormControl(null, [Validators.pattern(/^(?=\w*\d)(?=\w*)(?=\w*[a-z])\S{4,16}$/), Validators.required])
    });
  }

  ngOnInit(): void {
    this.getUserToken();
  }

  // llamamos al servicio para cerrar sesion de usuario
  cerrarSesion(){ this._usuarioService.cerrarSesionUser(); }

  // evento submit del formulario de cambio de contraseña
  changePasswords(){
    console.log(this.formPasswords);

    if(this.formPasswords.valid){
        if(this.errorPasswordActual) this.loading = false;
        else this.loading = true;

        this._usuarioService.updatePassword(this.formPasswords.value).subscribe(
          response => {
            this.errorPasswordActual = false;
            this.loading = false;

            if(response === 'Contraseña actualizada correctamente'){
                Swal.fire({
                  icon : 'success',
                  text : `${this.dataUsuario.nombre_usuario} tu constraseña se ha cambiado correctamente`,
                  confirmButtonText : 'Volver a perfil',
                  cancelButtonText : 'Cancelar',
                  showCancelButton : true
                })
                .then(result => {
                  if(result.value) this.router.navigateByUrl('/perfil');
                  else {
                    this.formPasswords.reset();
                  }
                });
            }
          },
          error => {
            this.loading = false;
            console.log(error);
            if(error && error.error?.message === "La contraseña actual es incorrecta") this.errorPasswordActual = true;
          });
    }
  };

  // evento submit del formulario de editar datos de usuario
  editarDatos(formulario : NgForm){
    this.errorForm = '';

    const resultNameCompletoUsuario = /^([A-Za-zÁÉÍÓÚñáéíóúÑ]{0}?[A-Za-zÁÉÍÓÚñáéíóúÑ\']+[\s])+([A-Za-zÁÉÍÓÚñáéíóúÑ]{0}?[A-Za-zÁÉÍÓÚñáéíóúÑ\'])+[\s]?([A-Za-zÁÉÍÓÚñáéíóúÑ]{0}?[A-Za-zÁÉÍÓÚñáéíóúÑ\'])?$/.test(formulario.controls.nombre_completo.value);
    const resultNameUsuario = /[a-z0-9-@ñáéíóú]+/.test(formulario.controls.nombre_usuario.value);
    const resultCorreoUsuario = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,3}$/.test(formulario.controls.correo.value);

    // si todos los campos pasan las validaciones llama al servicio
    if(resultNameCompletoUsuario && resultNameUsuario && resultCorreoUsuario){
        if(this.errorEmailExist.length) this.loading = false;
        else this.loading = true;

        // detectar un cambio en el textarea descripcion
        formulario['controls'].descripcion.valueChanges.subscribe( _ => this.changeTextArea = true);

        if(!formulario.pristine || this.changeTextArea){

          this._usuarioService.actualizarDatosUsuario2(formulario.value).subscribe(
            (response:UsuarioModelo) => {
              this.loading = false;
              this.errorEmailExist = false;
              this.dataUsuario = response;
              Swal.fire({
                icon : 'success',
                text : `${response.nombre_usuario} tus datos se han actualizado correctamente`,
                cancelButtonText : 'Ok',
              });
            },
            error => {
              this.loading = false;
              console.log(error);
              if(error && error.error?.message == "Validation failed: correo: Este correo ya existe, debes eliger otro"){
                  this.errorEmailExist = 'El correo ingresado ya existe debes elegir otro';
              }
            });

        } else {

          this.loading = false;
          Swal.fire({
            icon : 'question',
            text : 'No has modificado ningun dato',
            cancelButtonText : 'Ok'
          });

        }

    }
    else if(resultNameCompletoUsuario && resultNameUsuario && !resultCorreoUsuario){
        this.errorForm = 'El correo es invalido';
    }
    else if(resultCorreoUsuario && resultNameUsuario && !resultNameCompletoUsuario){
        this.errorForm = 'El campo nombre completo es invalido';
    }
    else if(!resultCorreoUsuario && !resultNameCompletoUsuario){
        this.errorForm = 'El correo y el nombre completo son invalidos';
    }
    else if(!resultCorreoUsuario && !resultNameUsuario && !resultNameCompletoUsuario){
        this.errorForm = 'El correo, el nombre completo y el nombre de usuario son invalidos';
    }
  }

  // metodo para retornar informacion del usuario logueado
  getUserToken(){
    this._usuarioService.getUsuarioToken().subscribe(
      (response:UsuarioModelo) => {
        this.dataUsuario = response;
      },
      error => {
        console.log(error);
      });
  };

  // metodo para determinar que informacion mostrar, si la info de password o data de usuario
  editInfo(opcion : string){
    if(opcion === 'password'){
        this.errorPasswordActual = false;
        this.formPasswords.reset();
        let elementoEsconder = document.getElementsByClassName('info_usuario_update');
        let elementoMostrar = document.getElementsByClassName('update_password_user');

        let spanDesactive = document.getElementsByClassName('opcion_editar_datos');
        let spanActive = document.getElementsByClassName('opcion_editar_password');

        if(elementoMostrar[0].classList[2] === 'view') return;
        else {

          // cambiar la clase active
          spanDesactive[0].classList.remove('active');
          spanActive[0].classList.add('active');

          // mostrar contenido a editar
          elementoEsconder[0].classList.remove('view');
          elementoEsconder[0].classList.add('hidde');

          elementoMostrar[0].classList.remove('hidde');
          elementoMostrar[0].classList.add('view');
        }
    }

    if(opcion === 'data'){
        let elementoEsconder = document.getElementsByClassName('update_password_user');
        let elementoMostrar = document.getElementsByClassName('info_usuario_update');

        let spanDesactive = document.getElementsByClassName('opcion_editar_password');
        let spanActive = document.getElementsByClassName('opcion_editar_datos');

        if(elementoMostrar[0].classList[2] === 'view') return;
        else {

            // cambiar la clase active
            spanDesactive[0].classList.remove('active');
            spanActive[0].classList.add('active');

            // mostrar contenido a editar
            elementoEsconder[0].classList.remove('view');
            elementoEsconder[0].classList.add('hidde');

            elementoMostrar[0].classList.remove('hidde');
            elementoMostrar[0].classList.add('view');
        }
    }
  };

  // metodo para agrgar un icono en la descripcion de usuario
  agregarIcono(icono : number){
    switch( icono ){

      case 1 :
        this.dataUsuario.descripcion += '😆';
        break;

      case 2 :
        this.dataUsuario.descripcion += '😂';
        break;

      case 3 :
        this.dataUsuario.descripcion += '😎';
        break;

      case 4 :
        this.dataUsuario.descripcion += '😘';
        break;

      case 5 :
        this.dataUsuario.descripcion += '😡';
        break;

      case 6 :
        this.dataUsuario.descripcion += '😭';
        break;

      case 7 :
        this.dataUsuario.descripcion += '😇';
        break;

      case 8 :
        this.dataUsuario.descripcion += '👏';
        break;

      case 9 :
        this.dataUsuario.descripcion += '👍';
        break;

      case 10 :
        this.dataUsuario.descripcion += '😜';
        break;

      case 11 :
        this.dataUsuario.descripcion += '👿';
        break;

      case 12 :
        this.dataUsuario.descripcion += '😷';
        break;

      case 13 :
        this.dataUsuario.descripcion += '😒';
        break;

      case 14 :
        this.dataUsuario.descripcion += '❤';
        break;

      case 15 :
        this.dataUsuario.descripcion += '😉';
        break;

      case 16 :
        this.dataUsuario.descripcion += '😅';
        break;

      case 17 :
        this.dataUsuario.descripcion+= '😁';
        break;

      case 18 :
      this.dataUsuario.descripcion += '💩';
        break;

      case 19 :
        this.dataUsuario.descripcion += '👊';
        break;

      case 20 :
        this.dataUsuario.descripcion += '😱';
        break;

      default : console.log('Error opcion no valida');
    }
  };

}
