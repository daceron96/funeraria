lista_productos = []
enviar = false

function lanzar_formulario(){
    $("#modal_formulario_prestamo").modal('show')
   
}

function detalle_prestamo(id_prestamo){

    $.ajax({
        url: '/product/loan-detail',
        type: 'GET',
        data: {'id_prestamo':id_prestamo},
        success: function(response){
            $('#referencia').empty().append('Referencia '+response.referencia )
            $('#fecha_registro').empty().append("<p><b>Fecha de registro: </b>" +response.fecha_registro+"</p>")
            if(response.en_espera){
                $('#fecha_reingreso').empty().append("<p><b>Fecha de reingreso: </b><span class='badge bg-danger px-3 py-2'>En Espera</span></p>")
            }else{
                $('#fecha_reingreso').empty().append("<p><b>Fecha de reingreso: </b>" +response.fecha_reingreso+"</p>")
            }
            $('#identificador').empty().append("<p><b>Identificador: </b>" +response.identificador+"</p>")
            $('#nombre_cliente').empty().append("<p><b>Nombre del cliente: </b>" +response.nombre_cliente+"</p>")
            $('#observacion').empty().append("<p><b>Observacion: </b>" +response.observacion+"</p>")
            $('#detalle_salida').empty()
            console.log(response)
            for(detalle in response.detalle_prestamo){
                var item = "<tr>"
                    + "<th scompe='row'>" + (parseInt(detalle) + 1) + "</th>"
                    + "<td>" + response.detalle_prestamo[detalle]['codigo'] + "</td>"
                    + "<td>" + response.detalle_prestamo[detalle]['producto'] + "</td>"
                    + "<td>" + response.detalle_prestamo[detalle]['categoria'] + "</td>"
                    + "<td>" + response.detalle_prestamo[detalle]['cantidad'] + "</td>"
                    +"</tr>"
                $('#detalle_salida').append(item)
            }
            $('#btn_reingresar').attr('onclick', "reingreso_prestamo(" + response['id'] + ")")
            $('#modal_detalle_prestamo').modal('show')
            
        
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
                
                console.log(lista_productos)
            }
            
        }
    })
}

function limpiar_formulario_prestamo(){
    $('#formulario').trigger("reset")
    $('.is-invalid').removeClass('is-invalid')
    $('#id_codigo').removeClass('is-valid')
    $('#mensaje_error').addClass('visually-hidden')
    $('#lista_productos').empty()
    lista_productos.splice(0, lista_productos.length)

    $('#modal_formulario_prestamo').modal('hide')

}

function crear_prestamo(){

    if(lista_productos.length != 0){
        $.ajax({
            data:$('#formulario').serialize(),
            url: '/product/loan-new/',
            type: $('#formulario').attr('method'),

            success: function (response) {
                const csrftoken = document.querySelector('[name=csrfmiddlewaretoken]').value;
                $.ajax({
                    data:{'data': JSON.stringify(lista_productos),'prestamo':response.respuesta},
                    url: '/product/loan-new-detail/',
                    type: "POST",
                    headers: { 'X-CSRFToken': csrftoken },
                    success:function(response2){
                        $('.table-active').removeClass('table-active')
                        $('#lista_prestamos').prepend(
                            "<tr class='text-center table-active' id='row_"+response2.id+"' >"
                            + "<td>" + response2.referencia + "</td>"
                            + "<td>" + response2.identificador + "</td>"
                            + "<td >" + response2.fecha_registro + "</td>"
					        + "<td><span class='badge bg-danger px-4 py-2 '>en espera</span></td>"
                            +"<td>"
                                + "<button type='button' class='btn btn-primary btn-sm d-inline-flex  px-3 '"
                                    +"onclick='detalle_prestamo("+response2.id+")'>"
                                    +"<i class='bi bi-search pe-1'></i> Ver"
                                +"</button>"
                            + "</td>"
                            +"</tr>"
                        )
                    }

                })
                $('#modal_formulario_prestamo').modal('hide')
                $('#success_modal').modal('show')
                $('#titulo_success').empty().append('Registro de nuevo prestamo')
                $('#parrafo_success').empty().append('El registro del prestamo ha sido registrado exitosamente.')
                
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

function reingreso_prestamo(id_prestamo) {

    $.ajax({
        url: '/product/loan-detail',
        type: 'GET',
        data: { 'id_prestamo': id_prestamo },
        success: function (response) {
            for (detalle in response.detalle_prestamo) {
                var item = 
                    "<td id='fila_" + response.detalle_prestamo[detalle]['codigo'] + "'>" + response.detalle_prestamo[detalle]['codigo'] + "</td>"
                    + "<td>" + response.detalle_prestamo[detalle]['producto'] + "</td>"
                    + "<td>" + response.detalle_prestamo[detalle]['categoria'] + "</td>"
                    + "<td id='cantidad_espera_" + response.detalle_prestamo[detalle]['codigo'] + "'><span class='badge bg-danger px-3 py-2'>" + response.detalle_prestamo[detalle]['cantidad'] + "</span></td>"
                    + "<td id='cantidad_ingreso_" + response.detalle_prestamo[detalle]['codigo'] + "'><span class='badge bg-warning px-3 py-2'>0</span></td>"
                    + "</tr>"
                lista_productos.push({ 'codigo': response.detalle_prestamo[detalle]['codigo'], 'espera': response.detalle_prestamo[detalle]['cantidad'], 'ingreso': 0 , 'lista_codigos' : response.detalle_prestamo[detalle]['codigos_consecutivo']})
                $('#lista_productos_reingreso').append(item)

            }
            $('#cabezera_ingreso').empty().append(
                "<h6 class='col-9'><b>Referencia </b> " + response.referencia + "</h6>"
                )
                
        
            $('#btn_crear_reingreso').attr('onclick','enviar_reingreso('+response.id+')')
        }
    })
    $('#modal_detalle_prestamo').modal('hide')
    $('#modal_formulario_reingreso').modal('show')
   
} 


function actualizar_reingreso() {
    let cad = ''
    let indice = $('#codigo_reingreso').val().indexOf("-")
    if (indice != -1) {
        cad = $('#codigo_reingreso').val().substring(0, indice).trim()
    } else {
        cad = $('#codigo_reingreso').val().trim()
    }
    let bandera = false
    for (let i = 0; i < lista_productos.length; i++) {
        if (lista_productos[i]['codigo'] === cad) {
            if (lista_productos[i]['espera'] != 0) {
                for(codigo in lista_productos[i]['lista_codigos']){
                    if(lista_productos[i]['lista_codigos'][codigo] == $('#codigo_reingreso').val().trim() ){
                        bandera = true
                        lista_productos[i]['ingreso'] = lista_productos[i]['ingreso'] + 1
                        lista_productos[i]['espera'] = lista_productos[i]['espera'] - 1
                        $('#codigo_reingreso').val('').focus().removeClass('is-invalid')
                        lista_productos[i]['lista_codigos'].splice(codigo,1)
                    }
                }
                if (lista_productos[i]['espera'] == 0) {
                    $('#cantidad_espera_' + cad).empty().append("<span class='badge bg-success px-3 py-2'>" + lista_productos[i]['espera'] + "</span>")
                    $('#cantidad_ingreso_' + cad).empty().append("<span class='badge bg-success px-3 py-2'>" + lista_productos[i]['ingreso'] + "</span>")
                    lista_productos.splice(i, 1)
                } else {
                    $('#cantidad_espera_' + cad).empty().append("<span class='badge bg-danger px-3 py-2'>" + lista_productos[i]['espera'] + "</span>")
                    $('#cantidad_ingreso_' + cad).empty().append("<span class='badge bg-warning px-3 py-2'>" + lista_productos[i]['ingreso'] + "</span>")
                }
            } else {
                $('#codigo_reingreso').addClass('is-invalid')
                $('#invalid_codigo_reingreso').empty().append('Ya han sido registrado todos los productos en espera correspondientes a este codigo')

            }
        }
        if (!bandera) {
            $('#codigo_reingreso').removeClass('is-valid')
            $('#codigo_reingreso').addClass('is-invalid')
            $('#invalid_codigo_reingreso').empty().append('El codigo de producto ingresado no esta dentro de la lista de espera o ya ha sido ingresado')

        }else{
            $('#codigo_reingreso').addClass('is-valid')
            $('#valid_codigo_reingreso').empty().append('Codigo ingresado exitosamente')

        }
    }
    if (lista_productos.length == 0) {
        $('#codigo_reingreso').removeClass('is-valid')
        $('#codigo_reingreso').addClass('is-invalid disabled').attr('disabled', true)
        $('#btn_ingresar_producto').addClass('disabled')
        $('#btn_crear_reingreso').removeClass('disabled')
        $('#invalid_codigo_reingreso').empty().append('Ya han sido registrados todos los productos en espera, Presiona "ingresar" para guardar el registro')
        enviar = true
    }


}

function limpiar_formulario_reingreso() {
    $('#modal_formulario_reingreso').modal('hide')
    $('#lista_productos_reingreso').empty()
    $('#codigo_reingreso').val('').removeClass('is-invalid').attr('disabled',false)
    $('#btn_ingresar_producto').removeClass('disabled')
    lista_productos.splice(0, lista_productos.length)

}

function enviar_reingreso(id_prestamo){
    if(enviar){
        const csrftoken = document.querySelector('[name=csrfmiddlewaretoken]').value;

        $.ajax({
            url: '/product/update-repayment/' + id_prestamo + "/",
            data : {'data':true},
            type : 'POST',
            headers: { 'X-CSRFToken': csrftoken },
            success: function(response){
                $('#estado_prestamo_'+id_prestamo).empty().append("<span class='badge bg-success px-4 py-2 '>Recibido</span>")
                $('#modal_formulario_reingreso').modal('hide')
                $('#success_modal').modal('show')
                $('.table-active').removeClass('table-active')
                $('#row_'+response.id).addClass('table-active')
                limpiar_formulario_reingreso()
                $('#titulo_success').empty().append('Registro de devolucion de productos')
                $('#parrafo_success').empty().append('El registro de devolucion de los productos ha sido exitoso')

            }
        })
    }
}