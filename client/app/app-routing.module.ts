import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './features/auth/components/login.component';
import { ChatComponent }  from './features/chat/components/chat.component';
import { AuthGuard } from './core/guards/auth.guard';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'chat',  component: ChatComponent, canActivate: [AuthGuard] },
  { path: '',      redirectTo: 'chat', pathMatch: 'full' },
  { path: '**',    redirectTo: 'chat' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
