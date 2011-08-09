{% load i18n %}
/**
 * 
@tag controllers, home
 *
 * PHA settings controller. Can remove a pha here and later set preferences, view logs, etc
 *
 *
 *
 * WARNING: carenet stuff broken and incomplete!!!
 * WARNING: carenet stuff broken and incomplete!!!
 * WARNING: carenet stuff broken and incomplete!!!
 * WARNING: carenet stuff broken and incomplete!!!
 * WARNING: carenet stuff broken and incomplete!!!
 * WARNING: carenet stuff broken and incomplete!!!
 * WARNING: carenet stuff broken and incomplete!!!
 * WARNING: carenet stuff broken and incomplete!!!
 * WARNING: carenet stuff broken and incomplete!!!
 * WARNING: carenet stuff broken and incomplete!!!
 *
 *
 * @author Pascal Pfiffner (pascal.pfiffner@childrens.harvard.edu)
 * @author Arjun Sanyal (arjun.sanyal@childrens.harvard.edu)
 */
$.Controller.extend('UI.Controllers.PHA',
/* @Static */
{
	onDocument: true,
	animDuration: 300,
	viewAnimationState: {},
	animateViewTo: function(view, x, y, delay) {
		delay = delay ? delay : 0;
		var now = (new Date()).getTime();
		view.css('position', 'absolute');			// Fix for Safari 5.1
		UI.Controllers.PHA.viewAnimationState = {
		       'view': view,
		      'start': {   'x': parseInt(view.css('left')) || 0,
		      			   'y': parseInt(view.css('top')) || 0,
		      			'time': now + delay},
		        'end': {   'x': x,
		        		   'y': y,
		        		'time': now + delay + UI.Controllers.PHA.animDuration},
		   'duration': UI.Controllers.PHA.animDuration,
		   'interval': null};
		
		UI.Controllers.PHA.viewAnimationState.interval = setInterval(UI.Controllers.PHA._animateView, 20);
	},
	
	_animateView: function() {
		var s = UI.Controllers.PHA.viewAnimationState;
		if (!s) {
			return;
		}
		
		// animating
		var now = (new Date()).getTime();
		if (now < s.end.time) {
			var delta = (now - s.start.time) / s.duration;
			var factor = ((delta * delta) * 3.0) - ((delta * delta * delta) * 2.0);
			var thisX = s.start.x + (factor * (s.end.x - s.start.x));
			var thisY = s.start.y + (factor * (s.end.y - s.start.y));
			
			s.view.css('left', thisX + 'px').css('top', thisY + 'px');
			return;
		}
		
		// finished
		s.view.css('left', s.end.x + 'px').css('top', s.end.y + 'px');
		
		clearInterval(s.interval);
		s.interval = null;
		UI.Controllers.PHA.viewAnimationState = {};
	},
	
	viewCircleState: {},
	circleViewTo: function(view, deg, centerPoint, delay) {		// view must already be in target div, absolutely positioned
		delay = delay ? delay : 0;
		var now = (new Date()).getTime();
		
		// calculate current angle
		var x = parseInt(view.css('left')) + view.outerWidth() / 2;
		var y = parseInt(view.css('top')) + view.outerHeight() / 2;
		var a = x - centerPoint.x;
		var b = y - centerPoint.y;
		var alpha = Math.atan2(b, a);
		var radius = Math.ceil(Math.sqrt(a*a + b*b));
		if (Math.round(alpha / 0.017453) == deg) {
			return false;
		}
		
		// init
		view.css('position', 'absolute');			// Fix for Safari 5.1
		var state = {
		       'view': view,
		     'center': centerPoint,
		     'radius': radius,
		      'start': { 'rad': alpha,
		      			'time': now + delay},
		        'end': { 'rad': deg2rad(deg),
		        		'time': now + delay + UI.Controllers.PHA.animDuration},
		   'duration': UI.Controllers.PHA.animDuration,
		   'interval': null
		};
		var rand = 'circle' + (new Date()).getTime() + Math.round(Math.random() * 100000);
		if (!UI.Controllers.PHA.viewCircleState.items) {
			UI.Controllers.PHA.viewCircleState.items = {};
		}
		UI.Controllers.PHA.viewCircleState.items[rand] = state;
		
		// set interval
		if (!UI.Controllers.PHA.viewCircleState.interval) {
			UI.Controllers.PHA.viewCircleState.interval = setInterval(UI.Controllers.PHA._circleView, 20);
		}
		return true;
	},
	
	_circleView: function() {
		var dict = UI.Controllers.PHA.viewCircleState;
		if (!dict) {
			return;
		}
		
		var now = (new Date()).getTime();
		var latest = 0;
		for (var rand in UI.Controllers.PHA.viewCircleState.items) {
			var s = UI.Controllers.PHA.viewCircleState.items[rand];
			if (s.start.time > now) {
				continue;
			}
			var thisRad = 0;
			latest = Math.max(s.end.time);
			
			// animating
			if (now < s.end.time) {
				var delta = (now - s.start.time) / s.duration;
				var factor = ((delta * delta) * 3.0) - ((delta * delta * delta) * 2.0);
				thisRad = s.start.rad + (factor * (s.end.rad - s.start.rad));
			}
			else {
				thisRad = s.end.rad;
				delete UI.Controllers.PHA.viewCircleState.items[rand];
			}
			
			// calculate position from angle
			var a = Math.sin(thisRad) * s.radius;
			var b = Math.cos(thisRad) * s.radius;
			var x = s.center.x + b - 20;			// 40 pixels wide
			var y = s.center.y + a - 20;
			
			s.view.css('left', x + 'px').css('top', y + 'px');
		}
		
		// all done
		if (latest < now) {
			clearInterval(UI.Controllers.PHA.viewCircleState.interval);
			UI.Controllers.PHA.viewCircleState.interval = null;
			UI.Controllers.PHA.viewCircleState.items = {};
		}
	},
	
	angleForAppIndex: function(i) {
		var startDeg = -70;
		var increment = 40;
		
		return startDeg + (i * increment);
	},
	
	coordinatesForAppIndex: function(i) {
		var myDeg = UI.Controllers.PHA.angleForAppIndex(i);
		
		var radius = 72;
		var a = Math.sin(deg2rad(myDeg)) * radius;
		var b = Math.cos(deg2rad(myDeg)) * radius;
		var top = 64 + a - 20;			// 40 pixels wide
		var left = 64 + b - 20;
		
		return {'top': top, 'left': left};
	}
},
/* @Prototype */
{
	record: {},
	all_apps: [],
	my_apps: [],
	carenets: [],
	
	ready: function() {
		
	},
	
	
	/**
	 * Click on our tab item
	 */
	'click': function() {
		$('#app_content').html(this.view('show', {'label': UI.Controllers.Record.activeRecord.label})).show();
		$('#app_content_iframe').attr('src', 'about:blank').hide();
		
		//this.reloadRecord();
		this.didReloadRecord(UI.Controllers.Record.activeRecord);
	},
	
	
	/**
	 * Chainload record info and information about the apps
	 */
	reloadRecord: function() {
		var record = UI.Controllers.Record.activeRecord;
		UI.Models.Record.get(record.record_id, record.carenet_id, this.callback('didReloadRecord'));
	},
	
	didReloadRecord: function(record) {			// reloaded record, get all apps
		this.record = record;
		UI.Models.PHA.get_all(this.callback('didGetAllApps'));
	},
	
	didGetAllApps: function(all_apps) {			// got all apps, get my apps
		this.all_apps = all_apps;
		
		// is this a carenet or a record? depending on which get the associated apps
		if (this.record.carenet_id) {
			UI.Models.PHA.get_by_carenet(this.record.carenet_id, null, this.callback('didGetMyApps'));
		}
		else if (this.record.record_id) {
			UI.Models.PHA.get_by_record(this.record.record_id, null, this.callback('didGetMyApps'));
		}
		else {
			alert("didGetAllApps()\n\nError, we got invalid record info, cannot continue");
		}
	},
	
	didGetMyApps: function(my_apps) {			// got my apps, get carenets we are in
		this.my_apps = my_apps;
		var self = this;
		
		// mark our apps in all_apps
		for (var i = 0; i < this.all_apps.length; i++) {
			var app = this.all_apps[i];
			app.enabled = (_(my_apps).detect(function(a) { return a.id === app.id; }));
		}
		
		// show
		var app_div = $('#apps');
		var params = {'all_apps': this.all_apps};
		app_div.empty().html(this.view('apps', params));
		$('#carenets').show();
		
		// setup app hovering (so we see in which carenets the app already is)
		app_div.find('.app').bind({
			'mouseover': function(event) {
				var app_id = $(this).model().id;
				$('#carenets').find('.carenet').each(function(i, elem) {
					var app_arr = $(elem).model().apps;
					if (app_arr && _(app_arr).detect(function(a) { return a.id === app_id; })) {
						$(elem).addClass('has_app');
					}
				});
			},
			'mouseout': function(event) {
				$('#carenets').find('.carenet').removeClass('has_app');
			}
		})
		
		// setup app dragging
		.bind('selectstart', function () { return false; })		// needed for WebKit (unless we upgrade jQuery UI to 1.8.6+)
		.draggable({
			distance: 8,
			revert: 'invalid',
			revertDuration: 300,
			helper: 'clone',
			containment: '#app_content',
			start: function(event, ui) {
				var app_id = $(this).model().id;
				$('#carenets').find('.carenet').each(function(i, elem) {
					var app_arr = $(elem).model().apps;
					if (app_arr && _(app_arr).detect(function(a) { return a.id === app_id; })) {
						$(elem).css('opacity', 0.4);
					}
				});
				ui.helper.addClass('app_dragged');
			},
			stop: function(event) {				// this may be called AFTER another 'start' if the user very quickly drags another app. We could use 'drag' instead of 'start'
				$('#carenets').find('.carenet').each(function(i, elem) { $(elem).css('opacity', 1); });
			}
		})
		
		// setup enabling/disabling
		.find('input[name="enable_app"]').click(function(event) {
			var checkbox = $(this);
			var app = checkbox.model();
			
			// enable
			if (checkbox.attr('checked')) {
				checkbox.attr('disabled', 'disabled');
				self.enableApp(app, checkbox);
			}
			
			// warn before disabling
			else if (confirm('{% trans "Disable this app?\n\nBy disabling this app it will also be removed from your carenets" %}')) {
				checkbox.attr('disabled', 'disabled');
				self.disableApp(app, checkbox);
			}
			else {
				checkbox.attr('checked', 'checked');
			}
		});
		
		// disable dragging disabled apps (must be done in the aftermath)
		app_div.find('.app.disabled').draggable('option', 'disabled', true);
		
		this.record.get_carenets(null, this.callback('didGetCarenets'));
	},
	
	didGetCarenets: function(carenets) {		// got our carenets, now get the apps per carenet
		this.carenets = carenets;
		
		self = this;
		var waiting_for = carenets.length;
		$(carenets).each(function(i, carenet) {
			carenet.apps = [];
			UI.Models.PHA.get_by_carenet(carenet.carenet_id, null, function(carenet_apps) {
				_(carenet_apps).each(function(c_app) {
					// if this _carenet_ pha is also in my_apps, remember it
					if (_(self.my_apps).detect(function(p) { return p.id === c_app.id; })) {
						carenet.apps.push(c_app);
					}
				});
				
				waiting_for--;
				if (waiting_for < 1) {
					self.didLoadCarenets();
				}
			}); // get_by_carenet
		}); // each carenet
	},
	
	didLoadCarenets: function() {
		$('#carenet_drag_apps').fadeIn('fast');
		
		// show carenets and their apps
		var nets = $('#carenets');
		var params = {
			'all_apps': this.all_apps,
			 'my_apps': this.my_apps,
			  'record': this.record,
			'carenets': this.carenets,
		};
		nets.empty().html(this.view('carenets', params));
		
		// setup apps already in carenets
		var self = this;
		nets.find('.carenet_app').each(function(i) {
			self.setupCarenetApp($(this));
		});
		
		// setup droppable
		nets.find('.carenet').droppable({
			accept: function(draggable) {
				var mod = $(this).model();
				if (!mod) {		// after leaving and re-visiting settings it seems there are droppable zombies still around somewhere
					$(this).remove();
					return false;
				}
				
				var drag_mod = draggable.model();
				if (drag_mod) {
					return ! _(mod.apps).detect(function(a) { return a.id === drag_mod.id; });
				}
				return false;
			},
			hoverClass: 'draggable_hovers',
			over: function(event, ui) {
				//if (ui.helper.hasClass('draggable_will_remove')) {		// 'draggable_will_remove' class is not yet set for quick drags. Set 'draggable_will_transfer' without checking as it doesn't hurt
					ui.helper.addClass('draggable_will_transfer');
				//}
			},
			out: function(event, ui) {
				if (ui.helper.hasClass('draggable_will_remove')) {
					ui.helper.removeClass('draggable_will_transfer');
				}
			},
			
			// add app on drop
			drop: function(event, ui) {
				self.addAppToCarenet(ui.draggable.model(), ui.helper, $(this));
			}
		});
		
		// setup carenet name editing
		nets.find('a.carenet_name').each(function(i) {
			self.setupCarenetName($(this));
		});
	},
	
	
	/**
	 * Event handlers
	 */
	addAppToCarenet: function(app, dragged_view, carenet_view) {
		var carenet = carenet_view.model();
		carenet_view.addClass('expanded');
		app.temporarily_added = true;
		
		// create the view at drop position
		var carenet_content = carenet_view.find('.carenet_content').first();
		var pos_parent = carenet_content.offset();
		var pos_app = dragged_view.offset();
		var half_width = (dragged_view.outerWidth() - 40) / 2;		// we will be 40 wide
		var half_height = (dragged_view.outerHeight() - 40) / 2;
		var cur_coords = {'top': pos_app.top - pos_parent.top + half_height, 'left': pos_app.left - pos_parent.left + half_width};
		var new_app_view = $(this.view('carenet_app', {'app': app, 'coords': cur_coords}));
		this.setupCarenetApp(new_app_view);
		
		// add the view and animate to final position
		dragged_view.detach();
		carenet_content.append(new_app_view);
		var coords = UI.Controllers.PHA.coordinatesForAppIndex(carenet.apps.length);
		UI.Controllers.PHA.animateViewTo(new_app_view, coords.left, coords.top);
		
		carenet_view.find('.carenet_num_items').first().text('~');
		
		// add to array and tell the server
		carenet.apps.push(app);
		carenet.add_pha(app, this.callback('didAddAppToCarenet', new_app_view, carenet_view));
	},
	didAddAppToCarenet: function(app_view, carenet_view, data, textStatus, xhr) {
		app_view.css('opacity', 1);
		app_view.model().temporarily_added = false;
		carenet_view.find('.carenet_num_items').first().text(carenet_view.model().apps.length);
		
		window.setTimeout(function() { carenet_view.removeClass('expanded'); }, 600);
	},
	
	didRemoveAppFromCarenet: function(app_view, carenet_view, data, textStatus, xhr) {
		
		// remove app from carenet app array
		var carenet = carenet_view.model();
		var app_id = app_view.model().id;
		if (carenet && carenet.apps && carenet.apps.length > 0) {
			for (var i = 0; i < carenet.apps.length; i++) {
				var app = carenet.apps[i];
				if (app.id == app_id) {
					carenet.apps.splice(i, 1);
					break;
				}
			}
		}
		
		// update view
		app_view.remove();		// can't fade out here as we need this to be gone when updating the other apps positions
		this.updateAppPositionsInCarenet(carenet_view);
		carenet_view.find('.carenet_num_items').first().text(carenet.apps.length);
		
		window.setTimeout(function() { carenet_view.removeClass('expanded'); }, 600);
	},
	
	changeCarenetName: function(form) {
		$('body').unbind('click');
		
		var new_name = form.find('input').first().val();
		var carenet_view = form.parentsUntil('.carenet').last().parent();
		var carenet = carenet_view.model();
		
		this.record.rename_carenet(carenet.carenet_id, new_name, this.callback('didChangeCarenetName', form, new_name));
	},
	didChangeCarenetName: function(name_form, new_name, data, textStatus, xhr) {
		if ('success' == textStatus) {
			name_form.parent().find('b').show();
			
			// return the form to a link
			name_form.parent().find('a').text(new_name).show();		// would be cleaner to fetch the new name from the 'data' xml
			name_form.remove();
		}
		else {
			alert("There was an error changing the name, please try again\n\n" + data);
			name_form.find('button').removeAttr('disabled');
		}
	},
	
	enableApp: function(app, checkbox) {
		UI.Models.PHA.enable_pha(this.record.record_id, app, this.callback('doEnableApp', app, checkbox));
	},
	doEnableApp: function(app, checkbox, data, textStatus, xhr) {
		if ('success' == textStatus) {
			data = $.parseJSON(data.responseText);
			
			// enabled the correct app
			if (data.app_id == app.id) {
				if (confirm(data.title + (data.description && data.description.length > 0 ? "\n\n" + data.description : ''))) {
					UI.Models.PHA.authorize_token(data.request_token, this.record.record_id, this.callback('didEnableApp', app, checkbox));
					return;
				}
			}
		}
		
		checkbox.removeAttr('checked').removeAttr('disabled');
	},
	didEnableApp: function(app, checkbox, data, textStatus) {
		if ('success' == textStatus) {
			
			// add to app tabs
			var img_name = app.data.name.toLowerCase().replace(/ +/g, '_');
			var icon = '<img class="app_tab_img" src="/jmvc/ui/resources/images/app_icons_32/' + img_name + '.png" alt="" />';
			var params = {'pha': app,
				       'fire_p': false,
				    'record_id': this.record.record_id,					// TODO: supply only record_id OR carenet_id
				   'carenet_id': this.record.carenet_id
			};
			$(document.documentElement).ui_main('add_app', params);
			
			// add to array and update status
			this.my_apps.push(app);
			var u_apps = _(this.my_apps);
			for (var i = 0; i < this.all_apps.length; i++) {
				var this_app = this.all_apps[i];
				this_app.enabled = (u_apps.detect(function(a) { return a.id === app.id; }));
			}
			checkbox.parentsUntil('.app').last().parent().removeClass('disabled').draggable('option', 'disabled', false);
		}
		
		// failed
		else {
			checkbox.removeAttr('checked');
		}
		
		checkbox.removeAttr('disabled');
	},
	
	disableApp: function(app, checkbox) {
		UI.Models.PHA.delete_pha(this.record.record_id, app.id, this.callback('didDisableApp', app, checkbox));
	},
	didDisableApp: function(app, checkbox, data, textStatus, xhr) {
		checkbox.removeAttr('disabled');
		
		// remove from array
		for (var i = 0; i < this.my_apps.length; i++) {
			if (this.my_apps[i] == app.id) {
				this.my_apps.splice(i, 1);
				break;
			}
		}
		
		// remove from app tabs
		var li_id = app.id.replace(/\W+/g, '_');
		$('#' + li_id).fadeOut('fast', function() { $(this).remove(); });
		
		// update view
		var my_apps = _(this.my_apps);
		for (var i = 0; i < this.all_apps.length; i++) {
			var this_app = this.all_apps[i];
			this_app.enabled = (my_apps.detect(function(a) { return a.id === app.id; }));
		}
		checkbox.parentsUntil('.app').last().parent().addClass('disabled').draggable('option', 'disabled', true);
		
		// remove from carenets (only in the UI, the server did this when disabling the app)
		var self = this;
		$('#carenets').find('.carenet').each(function(j) {
			var carenet_view = $(this);
			carenet_view.find('.carenet_app').each(function(i) {
				var view = $(this);
				if (view.model().id == app.id) {
					carenet_view.addClass('expanded');
					setTimeout(function() { UI.Controllers.MainController.poof(view); }, 200);
					setTimeout(function() { self.didRemoveAppFromCarenet(view, carenet_view); }, 450);
				}
			});
		});
	},
	
	
	/**
	 * Utilities
	 */
	setupCarenetName: function(carenet_name_view) {
		if (carenet_name_view) {
			var self = this;
			
			carenet_name_view.click(function(event) {
				event.stopPropagation();
				$(this).parent().find('b').hide();
				
				// insert an input field on link click
				var field = $('<input type="name" name="carenet_name" value="' + carenet_name_view.text() + '" />');
				var submit = $('<button type="submit">Save</button>');
				var form = $('<form/>', {'method': 'get', 'action': 'javascript:;'}).append(field).append(submit);
				form.submit(function() {
					var form = $(this);
					form.find('button').attr('disabled', 'disabled');
					self.changeCarenetName(form);
					return false;
				});
				carenet_name_view.before(form);
				carenet_name_view.hide();
				form.find('input').first().focus();
				form.parent().click(function(event) { event.stopPropagation(); });
				
				// cancel input if we click somewhere outside
				$('body').click(function(event) {
					$(this).unbind('click');
					var forms = $('#app_content').find('.carenet_inner').find('form');
					if (forms.length > 0) {
						forms.each(function(i) {
							$(this).siblings().show();
							$(this).remove();
						});
					}
				});
			});
		}
	},
	
	setupCarenetApp: function(app_view) {
		if (app_view) {
			var self = this;
			
			//** show app info on hover
			app_view.bind('mouseover', function(event) {
				var self_id = $(this).model().id;
				$('#apps').find('.app').each(function(i) {
					if ($(this).model().id == self_id) {
						$(this).addClass('app_showinfo');
					}
				});
			})
			.bind('mouseout', function(event) {
				if (!$(this).hasClass('app_dragged')) {
					$('#apps').find('.app').removeClass('app_showinfo');
				}
			})
			
			//** setup action on mouse up (can't use "stop" of draggable as this will first revert the item)
			.bind('mouseup', function(event) {
				var view = $(this);
				
				// remove from carenet
				if (view.hasClass('draggable_will_remove')) {
					view.draggable('destroy');
					
					// tell the server
					var carenet_view = view.parentsUntil('.carenet').last().parent();
					var carenet = carenet_view.model();
					if (carenet) {
						var app = view.model();
						carenet_view.addClass('expanded');
						carenet.remove_pha(app, self.callback('didRemoveAppFromCarenet', view, carenet_view));
					}
					else {
						view.remove();
					}
					
					// animate removal
					if (!view.hasClass('draggable_will_transfer')) {
						var parent = $('#app_content');
						//var p_off = parent.offset();		// '#app_content' is no offsetParent! Will this change? If so, subtract p_off from v_off
						var v_off = view.offset();
						
						UI.Controllers.MainController.poof(view);
					}
				}
			})
			
			//** setup dragging
			.bind('selectstart', function () { return false; })		// needed for WebKit (unless we upgrade jQuery UI to 1.8.6+)
			.draggable({
				distance: 8,
				revert: true,
				revertDuration: 300,
				containment: '#app_content',
				start: function(event, ui) {
					var view = ui.helper;
					view.addClass('app_dragged');
					var carenet_view = view.parentsUntil('.carenet').last().parent();
					carenet_view.addClass('expanded');
					
					// indicate (im)possible targets
					var app_id = view.model().id;
					$('#carenets').find('.carenet').not('.expanded').each(function(i, elem) {
						var app_arr = $(elem).model().apps;
						if (app_arr && _(app_arr).detect(function(a) { return a.id === app_id; })) {
							$(elem).css('opacity', 0.4);
						}
					});
				},
				drag: function(event, ui) {
					var view = ui.helper;
					var par = view.parent();
					var x = parseInt(view.css('left')) + view.outerWidth(true) / 2 - par.outerWidth(true) / 2;		// x and y as seen from the circle's center
					var y = parseInt(view.css('top')) + view.outerHeight(true) / 2 - par.outerHeight(true) / 2;
					var maxRad = 120;
					var myRad = Math.sqrt(x*x + y*y);
					if (myRad > maxRad) {
						view.addClass('draggable_will_remove');
					}
					else {
						view.removeClass('draggable_will_remove');
					}
				},
				stop: function(event, ui) {
					var view = ui.helper;
					view.removeClass('app_dragged');
					
					// revert UI (note: this may be called AFTER another 'start' if the user very quickly drags another app)
					$('#carenets').find('.carenet').each(function(i, elem) {
						$(elem).css('opacity', 1);
					});
					$('#apps').find('.app').removeClass('app_showinfo');
					
					if (!view.hasClass('draggable_will_remove')) {
						view.parentsUntil('.carenet').last().parent().removeClass('expanded');
					}
				}
			});
		}
	},
	
	updateAppPositionsInCarenet: function(carenet_view) {
		if (carenet_view) {
			var j = 0;
			carenet_view.find('.carenet_app').each(function(i) {
				var angle = UI.Controllers.PHA.angleForAppIndex(i);
				if (UI.Controllers.PHA.circleViewTo($(this), angle, {'x': 64, 'y': 64}, j*100)) {
					j++;
				}
			});
		}
	}
});



function deg2rad(deg) {
	return deg * 0.017453;
}

