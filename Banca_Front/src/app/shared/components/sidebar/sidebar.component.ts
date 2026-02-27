import { Component, Input, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

export interface MenuItem {
  titulo: string;
  items: { label: string; ruta: string }[];
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})

export class SidebarComponent {
  @Input() menuItems: MenuItem[] = [];
  menuAbiertoEstados: { [key: string]: boolean } = {};  // ← CAMBIO: objeto en lugar de booleano
  sidebarVisible = false;
  isSmallScreen = false;

  constructor() {
    this.checkScreenSize();
  }

  @HostListener('window:resize')
  onResize() {
    this.checkScreenSize();
  }

  checkScreenSize() {
    this.isSmallScreen = window.innerWidth < 768;
    if (!this.isSmallScreen) {
      this.sidebarVisible = true;
    }
  }

  // ← CAMBIO: ahora recibe el título del menú como parámetro
  toggleMenu(menuTitulo: string) {
    // Si no existe, inicializarlo como true (abierto por defecto)
    if (this.menuAbiertoEstados[menuTitulo] === undefined) {
      this.menuAbiertoEstados[menuTitulo] = true;
    }
    // Alternar el estado de ese menú específico
    this.menuAbiertoEstados[menuTitulo] = !this.menuAbiertoEstados[menuTitulo];
  }

  // ← NUEVO: método para verificar si un menú está abierto
  isMenuAbierto(menuTitulo: string): boolean {
    // Por defecto, los menús empiezan abiertos
    return this.menuAbiertoEstados[menuTitulo] !== false;
  }

  toggleSidebar() {
    this.sidebarVisible = !this.sidebarVisible;
  }

  closeSidebar() {
    if (this.isSmallScreen) {
      this.sidebarVisible = false;
    }
  }
}

// import { Component, Input, HostListener } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { RouterModule } from '@angular/router';

// export interface MenuItem {
//   titulo: string;
//   items: { label: string; ruta: string }[];
// }

// @Component({
//   selector: 'app-sidebar',
//   standalone: true,
//   imports: [CommonModule, RouterModule],
//   templateUrl: './sidebar.component.html',
//   styleUrls: ['./sidebar.component.css']
// })

// export class SidebarComponent {
//   @Input() menuItems: MenuItem[] = [];
//   menuAbierto = true;
//   sidebarVisible = false;
//   isSmallScreen = false;

//   constructor() {
//     this.checkScreenSize();
//   }

//   @HostListener('window:resize')
//   onResize() {
//     this.checkScreenSize();
//   }

//   checkScreenSize() {
//     this.isSmallScreen = window.innerWidth < 768;
//     if (!this.isSmallScreen) {
//       this.sidebarVisible = true;
//     }
//   }

//   toggleMenu() {
//     this.menuAbierto = !this.menuAbierto;
//   }

//   toggleSidebar() {
//     this.sidebarVisible = !this.sidebarVisible;
//   }

//   closeSidebar() {
//     if (this.isSmallScreen) {
//       this.sidebarVisible = false;
//     }
//   }
// }
