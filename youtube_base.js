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

	Rules = [".yt-lockup-video::-webkit-scrollbar{width:6px !important; height:6px !important;}",
			".yt-lockup-video::-webkit-scrollbar-track { -webkit-box-shadow: inset 0 0 6px rgba(0,0,0,0.3);}",
			".yt-lockup-video:hover::-webkit-scrollbar-track { -webkit-box-shadow: inset 0 0 6px rgba(0,0,0,0.5);}",
			".yt-lockup-video::-webkit-scrollbar-thumb {background: rgba(255,0,0,0.3);" +
			"-webkit-box-shadow: inset 0 0 6px rgba(0,0,0,0.5);width:4px !important;}",
			".yt-lockup-video:hover::-webkit-scrollbar-thumb {background: rgba(255,0,0,0.9);}"];
			$(Rules).each(function(ind, rule){
				document.styleSheets[0].insertRule(rule,0);
			});

	running = false; //to make sure code isn't over running
	organizer = function(){
		if(running == true){return};
		$(".item-section").not(".cust_org").each(function(){ //loop through each new section
			running = true;
			console.log('Optimizing new content... [YouTube Custom: by Jamin Szczesny - jxaxmxixn@gmail.com]');
			
			$(this).addClass('cust_org');
			
			users = {}; //holds unique channels (users) per section (i.e. Today, Yesterday)
			$(this).find('.yt-lockup-video').each(function(){//each viseo

				channel = $(this).find('div.yt-lockup-byline .g-hovercard.yt-uix-sessionlink.spf-link');
				
				if(channel){	
					user = $(channel[0]).text();		
					//make the channel (user) name more readable
					$(this).prepend($('<div>').css({
						fontWeight:'bold',color:'#222',fontSize:'1.5em'
					}).text(user)); 
					
					if(!(user in users)){ users[user] = [] }
					
					users[user].push({
						'obj':$(this),
						'watched':$(this).find('.watched-badge').length
					});		
				}	
			});
			
			for(var key in users){ //unique channels per section
				if(users[key][0]['obj'].parents('.multirow-shelf').length == 0){break;}//not slider rows
				if(users[key].length > 1){ //only channels with 2+ videos in section			
					//move watched to the bottom of the list order
					users[key].sort(function(a,b){
						return a['watched'] - b['watched'];
					});			
					watched_count = 0; found = 0; got_one = false;
					for(var ind in users[key]){
						if(users[key][ind]['watched'] == 0){	
							if(got_one == false){
								found = ind; got_one = true;
							}
						}else{
							watched_count++;
						}
					}
					target = users[key][found]['obj'];
					users[key].splice(found,1);
					count = users[key].length;
					
					watched_count = count - watched_count;
					if(watched_count < 0){watched_count = 0}
					//number of vids plus down arrow
					more = $('<div>').css({
						position:'absolute',right:'0px',bottom:'4px',
						color:function(){if(watched_count){return '#0c0'}else{return'#bbb'}},
						fontWeight:'bold',fontSize:'1.5em'
					}).text('+' + watched_count + '/' + count + '\u2193'); 
					
					target.css({
						position:'relative',overflowY:'scroll',
						maxHeight:target.height(),
						'-webkit-scrollbar-width':'100px'
					});
					
					
										
					target.append(more);
					
					for(var ind in users[key]){
						users[key][ind]['obj'].parent().hide();
						target.append(users[key][ind]['obj']);
					};
				}
			}
			running = false;
		});
	}
	
	organizer(); //first run
	$(document).on('DOMNodeInserted DOMNodeRemoved', "body", organizer); //run on page changes
});
