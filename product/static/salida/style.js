lista_productos = []

$(document).ready(function () {
    $('#btn_salidas').addClass('active').removeClass('link-dark')
});

function contenido_formulario() {
    $('#modal_formulario_salida').modal('show')
}


function eliminar_prod_lista(codigo) {
    $('#fila_' + codigo).remove()

    for (let i = 0; i < lista_productos.length; i++) {
        if (lista_productos[i].codigo == codigo) {
            lista_productos.splice(i, 1)
            break
        }
    }
}


function limpiar_formulario_salida(){
    $('#formulario').trigger("reset")
    $('.is-invalid').removeClass('is-invalid')
    $('#id_codigo').removeClass('is-valid')
    $('#mensaje_error').addClass('visually-hidden')
    $('#lista_productos').empty()
    lista_productos.splice(0, lista_productos.length)

    $('#modal_formulario_salida').modal('hide')

}

function detalle_salida(id_salida){

    $.ajax({
        url: '/product/exit-detail',
        type: 'GET',
        data: {'id_salida':id_salida},
        success: function(response){
            $('#referencia').empty().append('Referencia: '+response.referencia )
            $('#fecha_registro').empty().append("<p><b>Fecha de ingreso: </b>" +response.fecha_registro+"</p>")
            $('#tipo_salida').empty().append("<p><b>Tipo de salida: </b>" +response.tipo_salida+"</p>")
            $('#identificador').empty().append("<p><b>Identificador: </b>" +response.identificador+"</p>")
            $('#nombre_cliente').empty().append("<p><b>Nombre del cliente: </b>" +response.nombre_cliente+"</p>")
            $('#observacion').empty().append("<p><b>Observacion: </b>" +response.observacion+"</p>")
            $('#detalle_salida').empty()
            for(detalle in response.detalle_salida){
                var item = "<tr>"
                    + "<th scompe='row'>" + (parseInt(detalle) + 1) + "</th>"
                    + "<td>" + response.detalle_salida[detalle]['codigo'] + "</td>"
                    + "<td>" + response.detalle_salida[detalle]['producto'] + "</td>"
                    + "<td>" + response.detalle_salida[detalle]['categoria'] + "</td>"
                    + "<td>" + response.detalle_salida[detalle]['cantidad'] + "</td>"
                    +"</tr>"
                $('#detalle_salida').append(item)
            }
            $('#modal_detalle_salida').modal('show')
            
        
        }
    })

}

function agregar_lista(){
    let codigo_ing  = $('#id_codigo').val().trim()

    $.ajax({
        url : '/product/validate-code/',
        type: 'GET',
        data: {'codigo':codigo_ing},
        success: function(response){
            bandera = false
            existe = false
            if(response.error){
                $('#id_codigo').removeClass('is-valid').addClass('is-invalid')
                $('#invalid_codigo').empty().append(response.error)
                $('#id_codigo').focus()

            }else{
                $('#id_codigo').removeClass('is-invalid').addClass('is-valid')
                $('#valid_codigo').empty().append('Producto agregado exitosamente')
                $('#id_codigo').removeClass('is-invalid').addClass('is-valid')
                $('#valid_codigo').empty().append('Producto agregado exitosamente')
                for(producto in lista_productos){
                    if(lista_productos[producto].codigo == response.codigo){
                        for(cod in lista_productos[producto].lista_codigos){
                            if(lista_productos[producto].lista_codigos[cod] == codigo_ing ){
                                bandera = true 
                                break
                            }
                        }
                        if(bandera){
                            $('#id_codigo').removeClass('is-valid').addClass('is-invalid')
                            $('#invalid_codigo').empty().append('El codigo ingresado ya ha sido agregado a la lista de productos en salida')
                        }else{
                            lista_productos[producto].lista_codigos.push(codigo_ing)
                            lista_productos[producto].cantidad = lista_productos[producto].cantidad + 1
                            if(!lista_productos[producto].proveedores.includes(response.proveedor)){
                                lista_productos[producto].proveedores.push(response.proveedor)
                            }
                        }
                        existe = true
                    }
                    if(existe && !bandera){
                        $('#cantidad_'+response.codigo).empty().append(lista_productos[producto].cantidad)
                    }
                }
                if(!existe && !bandera ){
                    $('#mensaje_error').addClass('visually-hidden')
                    lista_productos.push({'codigo':response.codigo,'lista_codigos':[],'cantidad':1,'proveedores':[response.proveedor]})
                    lista_productos[lista_productos.length-1].lista_codigos.push(codigo_ing)
                    $('#lista_productos').append(
                        "<tr id='fila_" + response.codigo + "'>"
                            + "<td>" + response.codigo + "</td>"
                            + "<td>" + response.nombre + "</td>"
                            + "<td>" + response.categoria + "</td>"
                            + "<td id='cantidad_" + response.codigo + "'>1</td>"
                            + "<td><button class='btn  btn-outline-danger btn-sm' id='btn_del_" + response.codigo + "' type='button' data-bs-toggle='tooltip' data-bs-placement='bottom' data-bs-custom-class='custom-tooltip' title='Eliminar este producto de la lista' ><i class='bi bi-trash-fill'></i></button></td>"
                            + "</tr>"
                    )
                }
                    
                $('#id_codigo').val('').focus()
                $('#btn_del_' + response.codigo).attr("onclick", "eliminar_prod_lista('" + response.codigo + "')")
                
            }
            
        }
    })
}

function crear_salida(){

    if(lista_productos.length != 0){
        $.ajax({
            data:$('#formulario').serialize(),
            url: '/product/exit-create/',
            type: $('#formulario').attr('method'),

            success: function (response) {
                const csrftoken = document.querySelector('[name=csrfmiddlewaretoken]').value;
                $.ajax({
                    data:{'data': JSON.stringify(lista_productos),'salida':response.respuesta},
                    url: '/product/create-detail-exit/',
                    type: "POST",
                    headers: { 'X-CSRFToken': csrftoken },
                    success: function(response2){
                        $('.table-active').removeClass('table-active')
                        $('#lista_salidas').prepend(
                            "<tr class='text-center table-active' id='row_"+response2.id+"' >"
                            + "<td>" + response2.referencia + "</td>"
                            + "<td>" + response2.tipo + "</td>"
                            + "<td >" + response2.fecha + "</td>"
                            +"<td>"
                                + "<button type='button' class='btn btn-primary btn-sm d-inline-flex  px-3 '"
                                    +"onclick='detalle_salida("+response2.id+")'>"
                                    +"<i class='bi bi-search pe-1'></i> Ver"
                                +"</button>"
                            + "</td>"
                            +"</tr>"
                        )
                    }

                })
                $('#modal_formulario_salida').modal('hide')
                $('#success_modal').modal('show')
                $('#titulo_success').empty().append('Registro de nueva salida')
                $('#parrafo_success').empty().append('El registro de la nueva salida ha sido registrado exitosamente')
                
            },
            error: function (error) {
                console.log(error)
                error_formulario(error)
            }
        })
    }else{
        $('#mensaje_error').removeClass('visually-hidden')
    }

}
