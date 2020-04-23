import { Component, OnInit,  } from '@angular/core';
import { Router } from '@angular/router';
import { UsuarioService } from '../../services/export-service';
import { environment } from '../../../environments/environment';
import { UsuarioModelo } from '../../models/usuario';
declare var $ : any

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {

  public resultados : String[];
  public noResultadosBusqueda : boolean;
  public url : string;
  private usuarioLogueado : UsuarioModelo;

  constructor(private _usuarioService : UsuarioService, private router : Router) {
    this.url = environment.url;
  }

  ngOnInit(): void {
    this.getInforUserLogueado();
  }

  getInforUserLogueado(){
    this._usuarioService.getUsuarioToken().subscribe(
      (response:UsuarioModelo) =>
      this.usuarioLogueado = response,
      error => {
        console.log(error);
      });
  };

  // metodo que conecta al servicio y devuelve los usuarios encontrados
  search(busqueda : string){
    this.resultados = [];
    this.noResultadosBusqueda = false;

    if(busqueda.length === 0) { return; }
    else{
      this._usuarioService.buscarUsuario(busqueda).subscribe(
        response => {
          // console.log(response);

          (response.length > 0) ? this.resultados = response
          : this.noResultadosBusqueda = true;

        },
        error => {
          console.log(error);
        });
      }
    };

    // metodo para dirigir hacia el perfil de un usuario en particular
    irUsuario(nameUsuario : string){
      if(nameUsuario === this.usuarioLogueado.nombre_usuario) this.router.navigateByUrl('/perfil');
      else this.router.navigate(['/perfil', nameUsuario]);
    }


    // metodo para mostrar o esconder el menu responsive
    desplegarMenu(){
      $('.menu').slideToggle();
    };




}
