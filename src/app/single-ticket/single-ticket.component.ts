import { Component, OnInit, Inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SingleTicketService } from './single-ticket.service';
import { TicketInfo } from '../_models/ticket-info';
import { Alert } from '../_models/alert';
import 'moment-timezone';
import { TimezoneService } from '../shared-data/timezone.service';
import { MatDialog } from '@angular/material/dialog';
import { DialogComponent } from '../dialog/dialog.component';


@Component({
  selector: 'app-single-ticket',
  templateUrl: './single-ticket.component.html',
  styleUrls: ['./single-ticket.component.css']
})
export class SingleTicketComponent implements OnInit {

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private singleTicketService: SingleTicketService,
    private timezoneService: TimezoneService,
    public dialog: MatDialog) {
    this.route.params.subscribe(params => this.ticketId = params.ticketId);
  }
  newticket: TicketInfo = new TicketInfo();
  newname: String = '';
  newstatus: String = '';
  newmode: Boolean = false;
  newcron: String = '';
  newtimezone: String = '';
  newmembers: String = '';
  newemails: String = '';
  newdescription: String = '';
  newalert: Alert = new Alert();
  dataLoaded = false;
  ticket: TicketInfo = new TicketInfo();
  ticketId: String = '';
  addMemberSuccess = true;
  ghostMembers = [];
  statuses: any[] =
    [
      {
        value: 'NEW',
        view: 'NEW'
      },
      {
        value: 'ADMITTED',
        view: 'ADMITTED'
      },
      {
        value: 'IN_PROCESS',
        view: 'IN PROCESS'
      },
      {
        value: 'ON_HOLD',
        view: 'ON HOLD'
      },
      {
        value: 'REVISED',
        view: 'REVISED'
      },
      {
        value: 'SOLVED',
        view: 'SOLVED'
      },
      {
        value: 'CLOSED',
        view: 'CLOSED'
      }
    ];
  timezones = [];
  ngOnInit(): void {
    this.getTicket(this.ticketId);

  }

  getTimezones() {
    this.timezoneService.getTimezones().subscribe(result => {
      result.timezones.forEach(element => {
        this.timezones.push(new Timezone(element, element));
        this.dataLoaded = true;
      });
    });
  }
  getTicket(ticketId: String) {
    this.singleTicketService.getTicket(ticketId).subscribe((result) => {
      this.ticket = result.ticketsInfo[0];
      this.newname = this.ticket.name;
      this.newstatus = this.ticket.status;
      this.newmode = false;
      this.newcron = this.ticket.alert.cronExpression;
      this.newtimezone = this.ticket.alert.timezone;
      if (this.ticket.members != null) {
        this.newmembers = this.ticket.members.join('; ');
      }
      if (this.ticket.emails != null) {
        this.newemails = this.ticket.emails.join('; ');
      }
      this.newdescription = this.ticket.description;
      this.getTimezones();
    });
  }

  handleSave() {
    this.newticket.ticketId = this.ticket.ticketId;
    this.newticket.name = this.newname;
    this.newticket.status = this.newstatus;
    this.newmode = this.ticket.alert.mode;
    this.newalert.mode = this.newmode;
    this.newalert.timezone = this.newtimezone;
    this.newalert.cronExpression = this.newcron;
    this.newticket.alert = this.newalert;
    this.newticket.description = this.newdescription;
    this.newticket.members = this.newmembers.split(new RegExp('[,; ]')).filter(function (str) {
      return str != null && str != "";
    });
    this.newticket.emails = this.newemails.split(new RegExp('[,; ]')).filter(function (str) {
      return str != null && str != "";
    });

    this.singleTicketService.putTicket(this.newticket).subscribe((result) => {
      this.ticket = result.ticketsInfo[0];
      this.addMemberSuccess = true;
      this.ghostMembers = [];
      this.newticket.members.forEach(element => {
        if (!this.ticket.members.includes(element)) {
          this.addMemberSuccess = false;
          this.ghostMembers.push(element);
        }
      });
      if (this.addMemberSuccess) {
        this.router.navigateByUrl('ticket');
      }
    })
  }

  openDialog() {
    const dialogRef = this.dialog.open(DialogComponent, {
      width: '300px',
      data: { confirm: false }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        this.handleDelete();
      }
    });
  }

  handleDelete() {
    this.singleTicketService.deleteTicket(this.ticket.ticketId).subscribe((result) => {
      this.router.navigateByUrl('/ticket');
    }, (result) => {

    })

  }

  timeZoneChanged(timezone: String): void {
    this.newtimezone = timezone;
  }

  setTicketMode(e) {
    if (e.checked) {
      this.ticket.alert.mode = true;
    } else {
      this.ticket.alert.mode = false;
    }
  }

}
function Timezone(value: String, view: String) {
  this.value = value;
  this.view = view;
}

