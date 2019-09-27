import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { finalize, debounce } from 'rxjs/operators';

import { environment } from '@env/environment';
import { Logger, I18nService, AuthenticationService } from '@app/core';
import { DataService } from '@app/services/data.service';

const log = new Logger('Login');

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnInit {
  version: string = environment.version;
  public searchQuery: String = '';
  public searchResults: any;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private i18nService: I18nService,
    private authenticationService: AuthenticationService,
    private dataService: DataService
  ) {}

  ngOnInit() {
    console.log('[Search] Init');
  }

  async searchForQuery(searchQuery: String) {
    console.log('[Search] searching for: ', searchQuery);
    const response = await this.dataService.searchWikiData({
      searchQuery: searchQuery
    });
    this.searchResults = response.search;
    console.log('[Search] Response: ', response);
  }
  detailsForEntity(entity: any) {
    console.log('[GOTO Entity]', entity);
    this.router.navigate(['/entity/' + entity.id], { replaceUrl: true });
  }
}
