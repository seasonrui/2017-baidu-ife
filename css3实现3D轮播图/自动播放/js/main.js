$(document).ready(function($){

    setInterval(function(){
        var state = $('#container').css('animation-play-state');
        state = state === 'paused' ? 'running' : 'paused';
        $('#container').css({
            'animation-play-state': state,
        });
    },1000);
    
})