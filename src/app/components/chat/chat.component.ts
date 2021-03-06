import { Component, OnInit, ViewChild, ElementRef, NgZone, Input, SimpleChanges } from '@angular/core';

import { AuthenticationService } from '@app/core';
import { Router } from '@angular/router';
import { DataService } from '@app/services/data.service';

declare var annyang: any;

@Component({
  selector: 'chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit {
  @ViewChild('chatEnd') private chatEnd: ElementRef;
  public startedChat: boolean = false;
  isLoading: boolean;
  userCred: any;
  public quickreplies: Array<string> = [];
  public chatMessage: string;
  public configModel: any = {
    recording: false,
    synthesis: false,
    autorecord: false,
    userprofile: false,
    recordsupported: true
  };
  public inputDisabled = false;
  public chatMessages = <any>[];

  @Input() activeComponentConfig: any;
  public isActive: boolean;

  ngOnChanges(changes: SimpleChanges) {
    if (this.activeComponentConfig.name === 'chat') {
      console.log('[SettingChatActive]');
      this.isActive = true;
      if (!this.startedChat) {
        this.startedChat = true;
        this.chatMessage = 'What can you do?';
        this.queryBot();
      }
      try {
        setTimeout(() => {
          try {
            this.chatEnd.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
          } catch (err) {}
        }, 300);
      } catch (err) {}
    } else {
      this.isActive = false;
    }
  }

  constructor(
    private dataService: DataService,
    private authService: AuthenticationService,
    private router: Router,
    private _ngZone: NgZone
  ) {
    console.log('[Chat] Constructor');
    console.log('Creds', this.authService.credentials);
    this.userCred = this.authService.credentials;
  }

  async ngOnInit() {
    //console.log('creds ', this.userCred);
    if (!annyang) {
      console.log('Recording not supported!');
      this.configModel.recordsupported = false;
    }
    //const respo = await this.dataService.queryBot({ status: "hello World"});
  }

  private parseBotResponse = (resp: any) => {
    const responseBody = resp[0];
    const messages = responseBody.queryResult.fulfillmentMessages;
    this.quickreplies = [];
    for (const message of messages) {
      //do we have some text?
      if (message.message === 'text') {
        this.chatMessages.push({
          user: 'bot',
          type: 'text',
          message: message.text.text[0]
        });
      }

      if (message.message === 'card') {
        this.chatMessages.push({
          user: 'bot',
          type: 'card',
          message: message.card
        });
      }

      if (message.message === 'image') {
        this.chatMessages.push({
          user: 'bot',
          type: 'image',
          message: message.image
        });
      }

      //do we have quick replies
      if (message.message === 'quickReplies') {
        this.quickreplies = message.quickReplies.quickReplies;
      }
    }
    if (messages.length == 0) {
      //we may have some knowledge part that answers this message
      if (
        responseBody.queryResult.knowledgeAnswers &&
        responseBody.queryResult.knowledgeAnswers.answers &&
        responseBody.queryResult.knowledgeAnswers.answers.length > 0
      ) {
        for (const answer of responseBody.queryResult.knowledgeAnswers.answers) {
          this.chatMessages.push({
            user: 'bot',
            type: 'text',
            message: answer.answer
          });
        }
      }
    }
    try {
      setTimeout(() => {
        try {
          this.chatEnd.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } catch (err) {}
      }, 300);
    } catch (err) {}
  };

  public rewriteHttpToHttps = (text: string) => {
    if (!text) return text;
    return text.replace(/^http:\/\//i, 'https://');
  };

  public queryBot = async () => {
    const chatMessage = this.chatMessage;
    this.chatMessage = '';
    this.inputDisabled = true;
    this.chatMessages.push({
      user: this.userCred.token,
      message: chatMessage
    });
    //adding max cache
    if (this.chatMessages.length > 20) {
      this.chatMessages.shift();
    }

    setTimeout(() => {
      try {
        this.chatEnd.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } catch (err) {}
    }, 30);
    const resp = await this.dataService.queryBot({
      userId: this.userCred.token,
      queryText: chatMessage
    });
    //console.log('response: ', resp);
    this.inputDisabled = false;

    this.parseBotResponse(resp);
  };

  onQuickReply = (reply: string) => {
    this.chatMessage = reply;
    this.queryBot();
  };

  toggleProfile = () => {
    this.configModel.userprofile = this.configModel.userprofile ? false : true;
  };

  logout = () => {
    this.authService.logout().subscribe(() => this.router.navigate(['/login'], { replaceUrl: true }));
  };

  onClickRecord = () => {
    //console.log(this.configModel.recording);
    if (!this.configModel.recording) {
      this.configModel.recording;
      try {
        // Trying to start annyang
        annyang.removeCommands();
        annyang.removeCallback();
        annyang.addCallback('end', () => {
          this._ngZone.run(() => {
            console.log('setting recording back to non record');
            this.configModel.recording = false;
          });
        });
        annyang.addCallback('error', () => {
          this._ngZone.run(() => {
            console.log('setting recording back to non record cause of error');
            this.configModel.recording = false;
          });
        });
        annyang.addCommands(this.commands_record);
        // Start listening. You can call this here, or attach this call to an event, button, etc.
        annyang.start({ autoRestart: false, continuous: false });
      } catch (err) {
        console.log('Annyang error');
        console.log(err);
      }
    }
  };
  getShareUrl = (url: any) => {
    if (!url) return '';
    const baseUrL = "quizwire.reboting.com"
    let retStr = url.replace('https://'+baseUrL+'/services/image/', '');
    retStr = retStr.replace('.png', '');
    retStr = 'https://'+baseUrL+'/highscore/' + retStr;
    return retStr;
  };

  private commands_record = {
    '*val': (val: any) => {
      this._ngZone.run(() => {
        console.log('command start');
        this.chatMessage = val;
        this.queryBot();
      });
    }
  };
}
