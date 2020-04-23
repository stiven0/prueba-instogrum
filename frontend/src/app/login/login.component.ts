import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { UsuarioService } from '../services/export-service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  public formularioLogin : FormGroup;
  public errorDatosLogin : boolean;
  public loading : boolean;

  constructor(private _userService : UsuarioService, private router : Router) {
    this.loading = false;

    this.formularioLogin = new FormGroup({
      correo : new FormControl('', [Validators.required, Validators.pattern("[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,3}$")]),
      password : new FormControl('', [Validators.required, Validators.pattern(/^(?=\w*\d)(?=\w*)(?=\w*[a-z])\S{4,16}$/)]),
      check : new FormControl()
    });
  }

  ngOnInit(): void {
    if(localStorage.getItem('token')) this.router.navigateByUrl('/principal');

    if(localStorage.getItem('usuario-correo')){
      this.formularioLogin.setValue({
        correo : localStorage.getItem('usuario-correo'),
        password : '',
        check : true
      });
    };

  }

  // realizar login de usuario
  loginUser(){
    if(this.formularioLogin.invalid){
        this.errorDatosLogin = false;
        return;
    }
    this.loading = true;

    // llamamos al metodo para loguer al usuario
    this._userService.login(this.formularioLogin.value).subscribe(
      response => {
        this.errorDatosLogin = false;
        this.loading = false;

        // guardamos info del correo en el localStorage
        if(this.formularioLogin.controls.check.value){
            localStorage.setItem('usuario-correo', this.formularioLogin['controls'].correo.value);
        }

        // redirigimos hacia la pagina principal
        this.router.navigateByUrl('/principal');

      },
      error => {
        this.errorDatosLogin = false;
        this.loading = false;
        console.log(error);

        if(error.error?.message === 'Error, datos de usuario incorrectos') this.errorDatosLogin = true;
      });
  }

  // metodo para ocultar o mostrar la contraseña
  passwordView(elemento : any){
    if(elemento.value === '' ){
        return;
    } else {
      elemento.type === 'password' ? elemento.type = 'text' : elemento.type = 'password';
    }
  }

}
