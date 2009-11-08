/************** ClassCanvas ****************/
eletroCanvas = function(id) {
  this.init(id);
}

jQuery.extend(eletroCanvas.prototype, {

    id: '',
    columns: new Array(),
    index: '',
    
    init: function(id) {
        this.id = 'eletro_widgets_container_' + id;
        this.index = id;
        this.columns = new Array()
        var th = this;
        
        // initialize each column
        jQuery('#' + this.id).find('.eletro_widgets_col').each(function() {
            th.columns.push(new eletroColumn(this.id, th));
        });
        
        //add button behavior
        jQuery('#' + this.id).find('.eletro_widgets_add_button').click(function() {
            th.add(jQuery(this));
        });
        
        // select behaviour 
        jQuery('#' + this.id).find('#eletro_widgets_add').change(function() {
        	jQuery('#' + th.id).find('.widget_add_control').hide();
        	if (jQuery(this).val()) {
        		jQuery('#' + th.id).find('#widget_add_control_' + jQuery(this).val()).show();
        	}
        });
        
        //eletroClearAll behavior
        jQuery('#' + this.id).find('.eletroClearAll').click(function() {
            if (confirm(eletro.confirmClear)) {
                jQuery('#' + th.id + ' .eletro_widgets_col').each(function() {
                    jQuery(this).html('');
                });
                th.save();
            }
        });
        
        //Apply to public behavior
        jQuery('#' + this.id).find('.eletroApply').click(function() {
            if (confirm(eletro.confirmApply)) {
                jQuery.ajax({
                    type: 'POST',
                    dataType: 'html',
                    url: eletro.ajaxurl,
                     data: 
                    {
                        action: 'apply',
                        canvas_id: th.index
                    },
                    complete: function() {
                        alert('listo');
                    }
                });
            }
        });
        
        //Restore from public behavior
        jQuery('#' + this.id).find('.eletroRestore').click(function() {
            if (confirm(eletro.confirmRestore)) {
                jQuery.ajax({
                    type: 'POST',
                    dataType: 'html',
                    url: eletro.ajaxurl,
                     data: 
                    {
                        action: 'restore',
                        canvas_id: th.index
                    },
                    complete: function() {
                        location.reload();
                    }
                });
            }
        });
        
    },
    
    save: function() {
        
        //save canvas
        var th = this;
        
        values = this.getCurrentWidgets();
        
        debug = jQuery.ajax({
            type: 'POST',
            dataType: 'html',
            url: eletro.ajaxurl,
             data: 
            {
                action: 'save',
                'value[]': values,
                id: th.index
            },
            complete: function() {jQuery("#debug").append(debug.responseText)}
        });    
    },
    
    add: function(button) {
        var th = this;
        var widget_type = button.siblings('.add').val();
        if (widget_type == 'multi') {
        	
            // This is what we are going to post
            var widget_number = button.siblings('.multi_number').val();
        	var widget_id = button.siblings('.widget-id').val();
        	
            // This is used to know the ID of the new Widget div and create the new Instance
        	var id_base = button.siblings('.id_base').val();
        	var newName = id_base + '-' + widget_number;
        	
            // This increments multi-number value so the next instance will have another number
        	button.siblings('.multi_number').val( parseInt(button.siblings('.multi_number').val()) + 1 );
        } else {
            // When it is a single widget, all we want is its id
        	var widget_id = button.siblings('.widget-id').val();
            var newName = widget_id;
        }
        widgetContent = jQuery.ajax({
                type: 'POST',
                url: eletro.ajaxurl,
                dataType: 'html',
                data: 
                {
                    action: 'add',
                    widget_number: widget_number,
                    canvas_id: th.index,
                    widget_id: widget_id
                },
                complete: function() 
                {
                    jQuery('#' + th.id).find('#eletro_widgets_col_0').prepend(widgetContent.responseText);
                    new eletroItem(newName, th);  
                    th.save();
                    jQuery('#' + th.id).find('#eletro_widgets_add').val('');
                    jQuery('#' + th.id).find('.widget_add_control').hide();
                }
            });
    },
    
    getCurrentWidgets: function() {
    
        var col = 0;
        var values = Array();
        
        jQuery('#' + this.id).find('.eletro_widgets_col').each(function() {
            var thisItems = new Array();
            jQuery(this).find('div.itemDrag:not(".ui-sortable-helper")').each(function() {
                var number = jQuery(this).children('input[name=widget-number]').val();
                var id = jQuery(this).children('input[name=widget-id]').val();
                var widget = id + 'X|X' + number;
            	thisItems.push(widget);
            });            
            values.push(thisItems);
        });
        
        return values;   
    },
    
    updateControl: function(widget, disable) {
        var wOption = jQuery('#' + this.id).find('option[value="'+widget+'"]');
        if (disable  ) {
            wOption.attr('disabled', 'disabled');
        } else {
            wOption.removeAttr('disabled');
        }
    },
    
    refreshItem: function(instanceID) {
    
        var th = this;
        var widgetID = jQuery('#' + th.id).find('#' + instanceID).children('input[name=widget-id]').val();
        var widgetNumber = jQuery('#' + th.id).find('#' + instanceID).children('input[name=widget-number]').val();
        widgetContent = jQuery.ajax({
                type: 'POST',
                url: eletro.ajaxurl,
                dataType: 'html',
                data: 
                {
                    action: 'add',
                    refresh: 1,
                    widget_id: widgetID,
                    widget_number: widgetNumber,
                    canvas_id: th.index
                },
                complete: function() 
                {
                    jQuery('#' + th.id).find('#' + instanceID).html(widgetContent.responseText);
                    new eletroItem(instanceID, th);
                }
            });
    }
});

/************** END Canvas ****************/

/************** Class Column ****************/
eletroColumn = function(id, canvas) {
  this.init(id, canvas);
}

jQuery.extend(eletroColumn.prototype, {
   id: '',
   items: new Array(),

   init: function(id, canvas) {
     this.id = id;
     
     //initialize sortable
     jQuery('#' + canvas.id).find('#'+id).sortable(
			{
				accept			: 'itemDrag',
				placeholder		: 'dragAjuda',
				activeclass 	: 'dragAtivo',
				hoverclass 		: 'dragHover',
				handle			: 'h2.itemDrag',
				opacity			: 0.7,
				connectWith     : ['#' + canvas.id + ' .eletro_widgets_col'],
				update 		    : function() {
                      canvas.save();          
                },
				onStart         : function()
				{
					jQuery.iAutoscroller.start(this, document.getElementsByTagName('body'));
				},
				onStop          : function()
				{
					jQuery.iAutoscroller.stop();
				}
			});
     
     
     //initialize all existent items
     jQuery('#' + canvas.id).find('#'+id).children('.itemDrag').each(function() {
         new eletroItem(this.id, canvas);
     });
   }
});
/************** END Column ****************/

/************** Class Item ****************/
eletroItem = function(id, canvas) {
  this.init(id, canvas);
}

jQuery.extend(eletroItem.prototype, {
   id: '',
   container: '',

    init: function(id, canvas) {

        this.id = id;
        var th = this;

        //add controls and behaviors
        jQuery('#' + canvas.id).find('#' + id).children('.eletro_widgets_control').hide();
        jQuery('#' + canvas.id).find('#' + id).find('h2.itemDrag').append('<a alt="edit" class="edit"></a>').append('<a alt="remove" class="remove"></a>');

        jQuery('#' + canvas.id).find('#' + id).find('h2 a.edit').click(function() {
            jQuery(this).parents('.eletro_widgets_content').children(':not("h2")').toggle();
            jQuery(this).parents('.eletro_widgets_content').siblings('.eletro_widgets_control').toggle();                    
        });

        jQuery('#' + canvas.id).find('#' + id).find('h2 a.remove').click(function() {
            th.remove(id, canvas);
        });
        
        jQuery('#' + canvas.id).find('#' + id).find('.save').click(function() {
        	
            canvas.updateControl(id, false);
            
            var data = jQuery(this).parents('div.itemDrag').find('input').serialize();
        	
        	debug = jQuery.ajax({
                type: 'POST',
                dataType: 'html',
                url: eletro.ajaxurl,
                data: data,
                complete: function() {
                    jQuery("#debug").append(debug.responseText);
                    canvas.refreshItem(id);
                }
            });
        });
        canvas.updateControl(id, true);
    },
    
    remove: function(id, canvas) {
        jQuery('#' + canvas.id).find('#' + id).remove();
        canvas.save();
        canvas.updateControl(id, false);
    }

});
/************** END Item ****************/

jQuery(document).ready(function() {
    // loop through the containers
    jQuery('.eletro_widgets_container').each(function() {
        new eletroCanvas(jQuery(this).find('#eletro_widgets_id').val());
    });
});
