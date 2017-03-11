$(document).ready(function($){
    
    var rotateto = 0;
    var itemCount = $('img').length; 
    var eachRotation = 360/itemCount;
    var tzIstance = 200;

    function conRotate (rotatey) {
        $('#container').css({
            'transform'         : 'rotateY('+ rotatey +'deg)',
            '-ms-transform'     : 'rotateY('+ rotatey +'deg)',
            '-webkit-transform' : 'rotateY('+ rotatey +'deg)'
        })
    }

    $('img').each(function (index) {
        $(this).css({
            'transform' : 'rotateY('+( eachRotation * index )+'deg) translateZ('+tzIstance+'px)'
        }).attr('figure-rotation', ( eachRotation * index ) );
    });
    $('img').on('click', function () {
        // 获取container的con-rotation属性值
        var conRotation = $('#container').attr('con-rotation');
        var imgRotation = $(this).attr('figure-rotation');
        rotateto = conRotation - imgRotation;
        conRotate(rotateto);

    })

    
})