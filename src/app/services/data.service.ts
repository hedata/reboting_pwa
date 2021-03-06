import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class DataService {
  constructor(private httpClient: HttpClient) {}

  queryBot(context: any): Promise<any> {
    return this.httpClient.post('/services/chat', context).toPromise();
  }

  searchWikiData(context: any): Promise<any> {
    return this.httpClient.post('/services/entity/search', context).toPromise();
  }
  getEntityDetails(context: any): Promise<any> {
    return this.httpClient.post('/services/entity/details', context).toPromise();
  }

  getLatestRawStream(context: any): Promise<any> {
    return this.httpClient.post('/services/stream/getlatestrawitems', context).toPromise();
  }
  getLatestStreamItem(context: any): Promise<any> {
    return this.httpClient.post('/services/stream/items/latest', context).toPromise();
  }
  createUserStream(context: any): Promise<any> {
    return this.httpClient.post('/services/stream/user/create', context).toPromise();
  }
  getStreambyId(context: any): Promise<any> {
    return this.httpClient.post('/services/stream/getstreambyid', context).toPromise();
  }
  rateItem(context: any): Promise<any> {
    return this.httpClient.post('/services/rating/rate', context).toPromise();
  }
}
