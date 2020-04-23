import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { UsuarioService } from '../services/export-service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {

  public url : string;
  public formularioRegistro : FormGroup;
  public errorNameUsuario : boolean;
  public errorCorreoUsuario : boolean;
  public loading : boolean;

  constructor(private _usuarioService : UsuarioService, private router : Router) {
    this.url = environment.url;
    this.loading = false;

    // formulario de registro de usuario
    this.formularioRegistro = new FormGroup({
      nombre_completo : new FormControl('', [Validators.pattern(/[a-zA-ZÑñáéíóú]{2,30}$/), Validators.required]),
      correo : new FormControl('', [Validators.pattern(/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,3}$/), Validators.required]),
      nombre_usuario : new FormControl('', [Validators.pattern(/[a-z0-9-@ñáéíóú]+/), Validators.required]),
      password : new FormControl('', [Validators.pattern(/^(?=\w*\d)(?=\w*)(?=\w*[a-z])\S{4,16}$/), Validators.required])
    });

  }

  ngOnInit(): void {
    if(localStorage.getItem('token')) this.router.navigateByUrl('/principal');
  }

  // metodo para comprobar el nombre de usuario
  comprobarNameUsuario(name : string): Promise<boolean>{
    return new Promise((resolve, reject) => {

      this._usuarioService.comprobarNombreUsuario(name).subscribe(
        (response:{usuario:boolean}) => {
          response.usuario ? resolve(true) : resolve(false);
        },
        error => {
          console.log(error);
          reject(error);
        });
    });
  };

  // submit del formulario
  async registerUsuario(){
    if(this.formularioRegistro.invalid){
        this.errorNameUsuario = false;
        this.errorCorreoUsuario = false;
        return;
    }
    this.loading = true;

    // obtenemos un boolean para determinar si el nombre de usuario ya existe o no
    const responseNameUser = await this.comprobarNameUsuario(this.formularioRegistro.controls.nombre_usuario.value);

    if(responseNameUser){
        this.errorNameUsuario = false;

        // llamamos el metodo del servicio para registrar al usuario en la base de datos
        this._usuarioService.registrarUsuario(this.formularioRegistro.value).subscribe(
          response => {
            this.loading = false;
            this.errorCorreoUsuario = false;
            if(response){
              // modal de confirmacion de registro de usuario
              Swal.fire({
                icon : 'success',
                title : 'Te has registrado correctamente 👍' ,
                confirmButtonText : 'Iniciar sesion'
              })
              .then(result => {
                if(result.value) this.router.navigateByUrl('/login');
              });
            }
            this.formularioRegistro.reset();
          },
          error => {
            console.log(error);
            this.loading = false;
            if(error.error?.message === "usuario validation failed: correo: Este correo ya existe, debes eliger otro"){
                this.errorCorreoUsuario = true;
            }
          });

    } else {
        this.errorCorreoUsuario = false;
        this.errorNameUsuario = true;
        this.loading = false;
    }
  };

  // mostrar o no la contraseña
  passwordView(inputPassword : {value : string, type : string}){
    if(inputPassword.value === ''){
        return;
    } else {
        inputPassword.type == 'password' ? inputPassword.type = 'text' : inputPassword.type = 'password';
    }
  }

}
