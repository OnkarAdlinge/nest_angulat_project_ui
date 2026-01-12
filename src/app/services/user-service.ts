import { Injectable } from '@angular/core';
import { ApiDataService } from '../core/services/api-data-service';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  constructor(private apiService: ApiDataService) {}

  getUserProfileData(id: any) {
    return this.apiService.get(`users?id=${id}`);
  }

  updateUserProfileData(data: any) {
    return this.apiService.post('users/update', data);
  }
}
