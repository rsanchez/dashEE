$(function() {

	var url = window.location.href.split('?')[0];

	var dash = {
		
		settings : {
			columnSelector : '.column',
			widgetSelector: '.widget',
			headingSelector: '.heading',
			buttonsSelector: '.buttons',
			contentSelector: '.widget-content',
			widgetDefault : {
				movable: true,
				removable: true,
				collapsible: true,
				editable: false
			},
			widgetIndividual : {
				dynamic : {
					movable: false,
					removable: true,
					collapsible: true,
					editable: true
				}
			}
		},
		
		init : function() {
			var $widgets = dash.getWidgets();
	
			for(var i = 0; i < $widgets.length; i++) {
				var $widget = $($widgets[i]);
				dash.initWidget($widget);
			}
	
			dash.makeSortable();
		},
		
		initWidget : function(widget) {
			var wgt = {
				heading : $(dash.settings.headingSelector, widget),
				buttons : $(dash.settings.buttonsSelector, widget),
				content : $(dash.settings.contentSelector, widget),
				id : widget.attr('id'),
				settings : dash.getWidgetSettings(widget.attr('dashee')),
				col : widget.parents(this.settings).attr('id').substr(-1)
			};
			
			//  Remove button	
			if(wgt.settings.removable) {
				dash.removeWidget(widget, wgt);
			}
	
			//  Settings button	
			if(wgt.settings.editable) {
				dash.updateWidget(widget, wgt);
			}
	
			//  Collapse button	
			if (wgt.settings.collapsible) {
				dash.collapseWidget(widget, wgt);
			}
	
			//  Show buttons on hover	
			wgt.heading.hover($.proxy(function() {
				wgt.buttons.show();
			}, this), $.proxy(function() {
				wgt.buttons.hide();
			}, this));
		},
		
		getWidgets : function() {
			return $(this.settings.widgetSelector);
		},
		
		getWidgetSettings : function(id) {
			var settings = (id && this.settings.widgetIndividual[id]) ? this.settings.widgetIndividual[id] : {};
			return $.extend({}, this.settings.widgetDefault, settings);
		},
		
		addWidget : function() {},
		
		removeWidget : function(widget, wgt) {
			var $button = $('<a href="#" title="Remove" class="remove"></a>').appendTo(wgt.buttons);

			$button.mousedown($.proxy(function (e) {
				e.stopPropagation();	
			}, this));

			$button.click($.proxy(function (e) {
				col = widget.parents(this.settings).attr('id').substr(-1);
				
				$('#dashConfirm').dialog({
					resizable: false,
					height:140,
					modal: true,
					buttons: {
						'No': function() {
							$(this).dialog("close");
						},
						'Yes': $.proxy(function() {
							$.ajax({
								type: 'GET',
								url: url + '/?D=cp&C=addons_modules&M=show_module_cp&module=dashee&method=remove_widget&col='+wgt.col+'&wgt='+wgt.id,
								dataTyle: 'html',
								success: $.proxy(function(html) {
									widget.animate({
										opacity: 0	  
									},$.proxy(function () {
										widget.wrap('<div/>').parent().slideUp($.proxy(function () {
											widget.remove();
										}, this));
									}, this));
									$.ee_notice("Widget has been removed.", {type: 'success'});
									setTimeout("$('#dashConfirm').dialog('close');", 750);
								}, this),
								error: $.proxy(function(html) {
									$.ee_notice("ERROR: The widget you selected could not be removed.", {type: 'error', open: true});
								}, this)
							});
						}, this)
					},
					title: 'Remove Widget'
				});
				return false;
			}, this));
		},
		
		updateWidget : function(widget, wgt) {
			var $button = $('<a href="#" title="Settings" class="edit"></a>').appendTo(wgt.buttons);

			$button.mousedown($.proxy(function (e) {
				e.stopPropagation();
			}, this));

			$button.click($.proxy(function () {
				wgt.content.html('<p><center><img src="'+$('#dashLoader').attr('src')+'" /></center></p>');

				col = widget.parents(this.settings).attr('id').substr(-1);
				
				$.ajax({
					type: 'GET',
					url: url + '?D=cp&C=addons_modules&M=show_module_cp&module=dashee&method=widget_settings&col='+wgt.col+'&wgt='+wgt.id,
					dataTyle: 'html',
					success: $.proxy(function(html) {
						wgt.content.html(html);
						wgt.content.addClass('settings');

						$('form.dashForm').submit(function(event) {
							event.preventDefault();
							wgt.content.removeClass('settings');
							wgt.content.html('<p><center><img src="'+$('#dashLoader').attr('src')+'" /></center></p>');
		
							$.ajax({
								type: 'POST',
								url: url + '?D=cp&C=addons_modules&M=show_module_cp&module=dashee&method=update_widget_settings',
								data: $(this).serialize()+'&col='+wgt.col+'&wgt='+wgt.id,
								dataTyle: 'json',
								success: function(html) {
									var response = $.parseJSON(html);
									$('h2', wgt.heading).html(response.title);
									wgt.content.html(response.content);
								},
								error: function(html) {
									wgt.content.html('<p>There was a problem.</p>');
								}
							});
		
						});
					}, this),
					error: $.proxy(function(html) {
						wgt.content.html('<p>There was a problem.</p>');
					}, this)
				});
			}, this));
		},
		
		collapseWidget : function(widget, wgt) {
			var $button = $('<a href="#" title="Collapse" class="collapse"></a>').appendTo(wgt.buttons);

			$button.mousedown($.proxy(function (e) {
				widget.toggleClass('collapsed')
			}, this));
		},
		
		makeSortable : function() {
			var $sortableItems = this.getWidgets();
	
			$sortableItems.find(this.settings.headingSelector).css({
				cursor: 'move'
			}).mousedown($.proxy(function (e) {
				$sortableItems.css({width:''});
				$(e.currentTarget).parent().css({
					width: $(e.currentTarget).parent().width() + 'px'
				});
			}, this)).mouseup($.proxy(function (e) {
				if(!$(e.currentTarget).parent().hasClass('dragging')) {
					$(e.currentTarget).parent().css({width:''});
				} else {
					$(this.settings.columnSelector).sortable('disable');
				}
			}, this));
	
			$(this.settings.columnSelector).sortable({
				items: $sortableItems,
				connectWith: $(this.settings.columnSelector),
				handle: this.settings.headingSelector,
				placeholder: 'widget-placeholder',
				forcePlaceholderSize: true,
				revert: 300,
				delay: 100,
				opacity: 0.8,
				containment: 'document',
				start: $.proxy(function (e,ui) {
					$(ui.helper).addClass('dragging');
				}, this),
				stop: $.proxy(function (e,ui) {
					$(ui.item).css({width:''}).removeClass('dragging');
					$(this.settings.columnSelector).sortable('enable');
	
					var $widgets = this.getWidgets(),
						order = [];
	
					for (var i = 0; i < $widgets.length; i++) {
						var $widget = $($widgets[i]),
							col = parseInt($widget.parents('ul.column').attr('id').substr(-1));
	
						order.push(col+':'+$widget.attr('id'));
					};
	
					// save new order to DB
					$.ajax({
						type: 'GET',
						url: url + '?D=cp&C=addons_modules&M=show_module_cp&module=dashee&method=update_widget_order',
						data: 'order='+order.join('|'),
						dataTyle: 'html',
						success: function(html) {
							$.ee_notice("Widget order updated.", {type: 'success'});
						},
						error: function(html) {
							$.ee_notice("ERROR: Unable to update widget order in DB.", {type: 'error', open: true});
						}
					});
				}, this)
			});
		},
		
		dialog : function(type, txtid, boxtitle, boxwidth, boxheight) {
			if(type == 'confirm') {
				buttons = {
					'OK': function() {
						$(this).dialog("close");
						window.location = href;
					},
					'Cancel': function() {
						$(this).dialog("close");
					}
				};
				
				boxtitle = 'Please Confirm';
			} else {
				buttons = {
					'OK': function() {
						$(this).dialog("close");
					}
				};
			}

			if(boxwidth == '') {
				boxwidth = 250;
			}
		
			if(boxheight == '') {
				boxheight = 140;
			}

			$(txtid).dialog({
				resizable: false,
				width:boxwidth,
				height:boxheight,
				modal: true,
				buttons: buttons,
				title: boxtitle
			});			
		}
		
	};
	
	// Click event to collapse all widgets.
	$('a[href="#collapse"]').on('click', function() {
		dash.getWidgets().addClass('collapsed');
	});

	// Click event to expand all widgets.
	$('a[href="#expand"]').on('click', function() {
		dash.getWidgets().removeClass('collapsed');
	});
	
	// Click event to display "load layout" confirmation message.
	$('a.dashLoad').on('click', function(e) {
		e.preventDefault();
		dash.dialog('confirm', '#dashConfirmLoad', $(this).attr('href'), '', 140);
	});
	
	// Click event to display "delete layout" confirmation message.
	$('a.dashDelete').click(function (e) {
		e.preventDefault();
		dash.dialog('confirm', '#dashConfirmDelete', $(this).attr('href'), '', 140);
	});
	
	// Click event to display "reset layout" confirmation message.
	$('a.dashReset').click(function (e) {
		e.preventDefault();
		dash.dialog('confirm', '#dashConfirmReset', $(this).attr('href'), '', 190);
	});
	
	// Click event to display settings help.
	$('a.dashLayoutHelp').click(function() {
		dash.dialog('help', '#dashLayoutHelp', 'dashEE Layouts', 450, 340);
	});
	
	$('a.dashLockHelp').click(function() {
		dash.dialog('help', '#dashLockHelp', 'Lock Layouts');
	});
	
	// Click event to display available widgets listing.
	$('a[href="#widgets"]').on('click', function() {
		if($('#dashListing').is(':hidden')) {
			$('#dashListing .content').html('<p>&nbsp;</p><p><center>Loading...</center></p><p><center><img src="'+$('#dashLoader').attr('src')+'" /></center></p><p>&nbsp;</p>');
			$('#dashListing').slideDown();
			$.ajax({
				type: 'GET',
				url: url + '?D=cp&C=addons_modules&M=show_module_cp&module=dashee&method=get_widget_listing',
				dataTyle: 'html',
				success: function(html) {
					$('#dashListing .content').html(html);
				},
				error: function(html) {
					$('#dashListing .content').html('<p>There was a problem.</p>');
				}
			});
			$('a[href="#widgets"]').html('Close Widgets');
		}
		else {
			$('#dashListing').slideUp();
			$('a[href="#widgets"]').html('Widgets');
		}
	}); 
	
	// Click event to save current widget layout to DB.
	$('a[href="#save-layout"]').on('click', $.proxy(function (e) {
		$('#dashSaveLayout').dialog({
			resizable: false,
			height:210,
			width:350,
			modal: true,
			buttons: {
				'Cancel': function() {
					$(this).dialog("close");
				},
				'Save': $.proxy(function() {
					$.ajax({
						type: 'POST',
						url: url + '/?D=cp&C=addons_modules&M=show_module_cp&module=dashee&method=save_layout',
						data: $('#dashSaveLayout form').serialize(),
						dataTyle: 'html',
						success: $.proxy(function(html) {
							$.ee_notice('Your layout has been saved. Click "Settings" to assign it to a member group.', {type: 'success', open: true});
							$('#dashSaveLayout').dialog('close');
						}, this),
						error: $.proxy(function(html) {
							$.ee_notice("ERROR: The widget you selected could not be removed.", {type: 'error', open: true});
						}, this)
					});
				}, this)
			},
			title: 'Save Layout'
		});
		return false;
	}, this));
		
	dash.init();

});