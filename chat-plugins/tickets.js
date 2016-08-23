/*****************
* Reports Plugin *
* Credits: jd    *
*****************/
'use strict';

const fs = require('fs');
const moment = require('moment');

let pendingTickets = {};
function load() {
	try {
		pendingTickets = JSON.parse(fs.readFileSync('config/tickets.json'));
	} catch (e) {
		pendingTickets = {};
	}
}
load();

function save() {
	fs.writeFile('config/tickets.json', JSON.stringify(pendingTickets));
}

function addTicket(user, ticket) {
	let id = (Object.keys(pendingTickets).length + 1);
	while (pendingTickets[id]) id--;
	pendingTickets[id] = {};
	pendingTickets[id].user = user;
	pendingTickets[id].type = ticket;
	pendingTickets[id].id = id;
	pendingTickets[id].status = 'Pending Staff';
	pendingTickets[id].purchaseTime = moment().format('MMMM Do YYYY, h:mm A') + " EST";
	save();
	Wisp.messageSeniorStaff('/html A ticket has been purchased by ' + Wisp.nameColor(user, true) + '. ID: ' + id + ' Ticket: ' + Tools.escapeHTML(ticket));
	Rooms('upperstaff').add('|raw|A ticket has been purchased by ' + Wisp.nameColor(user, true) + '. ID: ' + id + ' Ticket: ' + Tools.escapeHTML(ticket)).update();
}
Wisp.addTicket = addTicket;

exports.commands = {
	ticket: 'tickets',
	tickets: {
		'': 'view',
		view: function (target, room, user) {
			if (!this.can('seniorstaff')) return false;
			if (!this.runBroadcast()) return;
			if (Object.keys(pendingTickets).length < 1) return this.sendReplyBox("There's no pending tickets.");

			let output = '|raw|<table border="1" cellspacing ="0" cellpadding="3"><tr><th>ID</th><th>User</th><th>Ticket</th><th>Purchase Time</th><th>Status</th></tr>';
			for (let u in Object.keys(pendingTickets)) {
				let ticket = pendingTickets[Object.keys(pendingTickets)[u]];
				let date = ticket.purchaseTime;
				output += '<tr><td>' + ticket.id + '</td><td>' + Wisp.nameColor(ticket.user, true) + '</td><td>' +
					Tools.escapeHTML(ticket.type) + '</td><td>' + date + ' </td><td>' + (ticket.status === 'Pending Staff' ? '<font color=blue>Pending Staff</font>' : (~ticket.status.indexOf('Accepted by') ? '<font color=green>' + Tools.escapeHTML(ticket.status) + '</font>' : Tools.escapeHTML(ticket.status))) + '</td></tr>';
			}
			this.sendReply(output);
		},

		accept: function (target, room, user) {
			if (!this.can('seniorstaff')) return false;
			if (!target) return this.errorReply("Usage: /tickets accept [id]");
			if (!pendingTickets[target]) return this.errorReply("There's no ticket with that id.");
			if (pendingTickets[target].status !== 'Pending Staff') return this.errorReply("That ticket isn't pending staff.");
			pendingTickets[target].status = "Accepted by " + user.name;
			save();

			this.sendReply("You've accepted the report by " + pendingTickets[target].user);
			Wisp.messageSeniorStaff("/html " + Wisp.nameColor(user.name, true) + " accepted the ticket by " + Wisp.nameColor(pendingTickets[target].user, true) +
				". (ID: " + target + ")");
			Rooms('upperstaff').add("|raw|" + Wisp.nameColor(user.name, true) + " accepted the ticket by " + pendingTickets[target].user + ". (ID: " + target + ")").update();
		},

		delete: 'finish',
		finish: function (target, room, user) {
			if (!this.can('seniorstaff')) return false;
			if (!target) return this.errorReply("Usage: /tickets finish [id]");
			if (!pendingTickets[target]) return this.errorReply("There's no ticket with that id.");
			Wisp.messageSeniorStaff("/html " + Wisp.nameColor(user.name, true) + " has completed the ticket by " + pendingTickets[target].user + ". (ID: " + target + ")");
			Rooms('upperstaff').add("|raw|" + Wisp.nameColor(user.name, true) + " has completed the ticket by " + pendingTickets[target].user + ". (ID: " + target + ")").update();
			delete pendingTickets[target];
			save();
			this.sendReply("That ticket has been completed.");
		},
	},
	ticketshelp: [
		"/tickets accept - Accepts a ticket.",
		"/tickets finish/delete - Marks a ticket as finished and deletes it.",
		"/tickets view - Displays pending tickets.",
	],
};
