/**
* by Jamin Szczesny 2016
*
* Adds better readable channel (user) names above videos
* Combines channels videos (using scroling) with 2+ videos in a section
* Moves "Watched" videos from main video displayed (where possible)
* Adds a +#(\u2193 down arrow) notifier letting you know how many more vids there are
* Places "Watched" videos at the bottom of the queue (if there are multiple)
* Very rough for simple functionality
*
**/

$.noConflict();
jQuery(document).ready(function($){

	// CSS to add to the document
	CSS_Rules = [".yt-lockup-video::-webkit-scrollbar{width:6px !important; height:6px !important;}",
	
			".yt-lockup-video::-webkit-scrollbar-track { -webkit-box-shadow: inset 0 0 6px rgba(0,0,0,0.3);}",
			
			".yt-lockup-video:hover::-webkit-scrollbar-track { -webkit-box-shadow: inset 0 0 6px rgba(0,0,0,0.5);}",
			
			".yt-lockup-video::-webkit-scrollbar-thumb {background: rgba(255,0,0,0.3);" +
			"-webkit-box-shadow: inset 0 0 6px rgba(0,0,0,0.5);width:4px !important;}",
			
			".yt-lockup-video:hover::-webkit-scrollbar-thumb {background: rgba(255,0,0,0.9);}"];
			
			$(CSS_Rules).each(function(ind, rule){
				document.styleSheets[0].insertRule(rule, 0);
			});
			
			
	running = false; //to make sure code isn't over running
	
	function organizer(){
		if(running == true){return};
		$(".item-section").not(".cust_org").each(function(){ //loop through each new section
			running = true;
			users = {};
			$(this)
				.addClass('cust_org')
				//holds unique channels (users) per section (i.e. Today, Yesterday)
				.find('.yt-lockup-video').each(function(){//each viseo

				//with each video in section, get channel name and add it to a list for sorting etc...
					if(channel = $(this).find('div.yt-lockup-byline .g-hovercard.yt-uix-sessionlink.spf-link')){	
						
						channel_name = $(channel[0]).text();
						
						//make the channel (user) name more readable
						$(this).prepend($(channel[0]).css({
							fontWeight:'bold',color:'#222',fontSize:'1.5em'
						}));
						
						if(!(channel_name in users)){ users[channel_name] = [] }
						
						//push each video into an array for sorting
						users[channel_name].push({
							'obj':$(this),
							'watched':$(this).find('.watched-badge').length
						});		
					}	
				});
						
			
			//Sort and configure each channel's video's in a section
			for(var channel in users){ //unique channels per section
				//console.log(channel, users.indexOf(users[channel]));
				if(users[channel][0]['obj'].parents('.multirow-shelf').length == 0){break;}//not slider rows
				if(users[channel].length > 1 || users[channel][0]['watched']){ //only process channels with 2 or more videos in section or a lone watched video		
					
					//sort watched vid's to the bottom of the list
					users[channel].sort(function(a,b){
						return a['watched'] - b['watched'];
					});	

					//Count & Find first (or only) unwatched video (or last if all watched)...
					watched_count = 0; target = false; 
					for(var video in users[channel]){
						if(users[channel][video]['watched'] == false){	
							if(target === false){
								target = users[channel][video]['obj'];
								users[channel].splice(video, 1); //remove target video so not to add itself
							}
						}else{
							watched_count++;
						}
					}
					if(target === false){ // meaning all videos from channel have been watched
						last_video = users[channel].length - 1;
						target = users[channel][last_video]['obj'];
						users[channel].splice(last_video, 1); 
						$(target.parents('ul')[0])
							.append(target.parent());
						target.parent().css('transform','scale(0.8)');
					}				
					
					count = users[channel].length;
					
					if(count > 0){
						watched_count = count - watched_count;
						if(watched_count < 0){watched_count = 0}
						//number of vids plus down arrow
						more = $('<div>').css({
							position:'absolute',right:'0px',bottom:'4px',
							color:function(){if(watched_count){return '#0c0'}else{return'#bbb'}},
							fontWeight:'bold',fontSize:'1.5em'
						}).text('+' + watched_count + '/' + count + '\u2193'); 
						
						target
							.css({
								position:'relative',overflowY:'scroll',
								maxHeight:target.height(),
								'-webkit-scrollbar-width':'100px'
							})
							.append(more);
											
					}
					for(var video in users[channel]){
						old_parent = users[channel][video]['obj'].parent();
						target.append(users[channel][video]['obj']);
						old_parent.remove();
					};
				}
			}
			
			//Other CSS tweaks
			$(this).find(".yt-channel-title-icon-verified").each(function(){
				$(this).parent().css('float','left');
			});
			
			running = false;
		});
	}
	
	organizer(); //first run
	$(document).on('DOMNodeInserted DOMNodeRemoved', "body", organizer); //run on page changes
});