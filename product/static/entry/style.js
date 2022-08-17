lista_productos = []
lista_productos.referencia
lista_productos.id_proveedor
enviar = false
$(document).ready(function () {
    $('#link_entrada').addClass('active').removeClass('link-dark')
    $("#formulario_ingreso").on('submit', function (evt) {
        evt.preventDefault();
        actualizar_ingreso()
    });
});

function contenido_formulario() {
    $('#modal_formulario_entrada').modal('show')
    $('#btn_crear_entrada').removeClass('visually-hidden')
    $('#btn_editar_entrada').addClass('visually-hidden')
}


function detalle_entrada(id_entrada) {
    $.ajax({
        url: '/product/entry-detail/',
        type: 'GET',
        data: { 'id_entrada': id_entrada },

        success: function (response) {
            $('#modal_detalle_entrada').modal('show')
            $('#referencia').empty().append("Referencia " + response.reference)
            if (!response.in_wait) {
                $('#estado').empty().append("<span class='badge bg-success px-3 py-2'>Ingresado</span>")
            } else {
                $('#estado').empty().append("<span class='badge bg-danger px-3 py-2'>En espera</span>")
            }
            if (!response.in_wait) {
                $('#fecha_ingreso').empty().append("<p><b>Fecha de ingreso: </b><span class='badge bg-success px-3 py-2'>" + response.modified_date + "</span></p>")
            } else {
                $('#fecha_ingreso').empty().append("<p><b>Fecha de ingreso: </b><span class='badge bg-danger px-3 py-2'>En espera</span></p>")
            }
            $('#proveedor').empty().append("<p><b>Proveedor: </b>" + response.supplier + "</p>")
            $('#detalle_entrada').empty()
            for (detail in response.details) {
                var item = '<tr>'
                    + "<td>" + response.details[detail]['code'] + "</td>"
                    + "<td>" + response.details[detail]['name'] + "</td>"
                    + "<td>" + response.details[detail]['category'] + "</td>"
                    + "<td>" + response.details[detail]['quantity'] + "</td>"
                    + "</tr>"

                $('#detalle_entrada').append(item)
            }
            $('#btn_editar').attr('onclick', "llenar_formulario(" + response['id'] + ")")
           
            if (!response.in_wait) {
                $('#btn_ingresar').addClass('visually-hidden')
                $('#btn_editar').addClass('visually-hidden')
            }else{
                $('#btn_ingresar').removeClass('visually-hidden')
                $('#btn_editar').removeClass('visually-hidden')
            }
            if (response['created_qr']) {
                $('#btn_ingresar').attr('onclick', "llenar_formulario_ingreso(" + response['id'] + ")")
                $('#btn_editar').addClass('visually-hidden')
            } else {
                $('#btn_ingresar').attr('onclick', "confirmar_ingreso(" + response['id'] + ")")
            }

        }
    })
}


function autocompletar_proveedor() {
    $("#id_proveedor").autocomplete({
        source: '/product/autocomplete-supplier/',
        autoFocus: true
    });
}

function autocompletar_producto() {


    $("#id_producto").autocomplete({
        source: '/product/autocomplete-product/',
        autoFocus: true
    });

}

function validar_campos_vacios(campo) {
    let bandera = false
    if ($('#id_' + campo).val().trim().length > 0) {
        bandera = true
        $('#id_' + campo).removeClass('is-invalid')
        $('#invalid_' + campo).empty()
    } else {
        $('#id_' + campo).addClass('is-invalid')
        $('#invalid_' + campo).empty().append('Este campo es obligatorio')
    }
    return bandera
}

function obtener_valor(campo) {
    let cad = ''
    let indice = $('#id_' + campo).val().indexOf("|")
    if (indice != -1) {
        cad = $('#id_' + campo).val().substring(0, indice).trim()
    } else {
        cad = $('#id_' + campo).val().trim()
    }
    return cad
}

function actualizar_lista(codigo) {
    for (let i = 0; i < lista_productos.length; i++) {

        if (lista_productos[i].codigo == codigo) {

            lista_productos[i].cantidad = lista_productos[i].cantidad + parseInt(obtener_valor('cantidad'))
            $('#cantidad_' + obtener_valor('producto')).empty().append(lista_productos[i].cantidad)
            $('#id_producto').val('').focus()
            $('#id_cantidad').val('')
            return false
        }
    }
    return true
}

function get_producto() {
    let vali_cant = validar_campos_vacios("cantidad")
    let vali_prod = validar_campos_vacios("producto")

    if (vali_cant && vali_prod) {

        if (actualizar_lista(obtener_valor('producto')))
            $.ajax({
                url: '/product/product-get/',
                type: 'GET',
                data: { 'producto': obtener_valor('producto') },
                success: function (response) {
                    $('#lista_productos').append(
                        "<tr id='fila_" + response.code + "'>"
                        + "<td>" + response.code + "</td>"
                        + "<td>" + response.name + "</td>"
                        + "<td>" + response.category + "</td>"
                        + "<td id='cantidad_" + response.code + "'>" + obtener_valor('cantidad') + "</td>"
                        + "<td><button class='btn  btn-outline-danger btn-sm' id='btn_del_" + response.code + "' type='button' data-bs-toggle='tooltip' data-bs-placement='bottom' data-bs-custom-class='custom-tooltip' title='Eliminar este producto de la lista' ><i class='bi bi-trash-fill'></i></button></td>"
                        + "</tr>"
                    )
                    $('#btn_del_' + response.code).attr("onclick", "eliminar_prod_lista('" + response.code + "')")
                    $('#mensaje_error').addClass('visually-hidden')
                    lista_productos.push({ 'codigo': response.code, 'cantidad': parseInt(obtener_valor('cantidad')) })
                    $("#id_producto").val('').focus()
                    $("#id_cantidad").val('')
                },
                error: function (error) {
                    $('#id_producto').addClass('is-invalid')
                    $('#invalid_producto').empty().append('El producto ingresado no ha sido registrado')
                }
            })
    }

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

function crear_nueva_entrada() {
    if (lista_productos.length > 0) {
        const csrftoken = document.querySelector('[name=csrfmiddlewaretoken]').value;
        $.ajax({
            data: {
                'data': JSON.stringify(lista_productos),
                'referencia': lista_productos.referencia,
                'proveedor': lista_productos.id_proveedor
            },
            url: '/product/entry-create/',
            type: 'POST',
            headers: { 'X-CSRFToken': csrftoken },
            success: function (response) {
                $('#modal_formulario_entrada').modal('hide')
                $('#success_modal').modal('show')
                $('#titulo_success').empty().append('Registrar nueva entrada')
                $('#parrafo_success').empty().append('La nueva entrada ha sido registrada exitosamente')
                limpiar_formulario_entrada()
                $('.table-active').removeClass('table-active')
                $('#lista_entradas').prepend(
                    "<tr class='table-active' id='row_"+response.id+"' >"
                    + "<td>" + response.referencia + "</td>"
                    + "<td>" + response.proveedor + "</td>"
                    + "<td>" + response.fecha_ingreso + "</td>"
                    + "<td id='estado_"+response.id+"'><span class='badge bg-danger px-4 py-2'>En espera</span></td>"
                    +"<td>"
                        + "<button type='button' class='btn btn-primary btn-sm d-inline-flex  px-3 '"
                            +"onclick='detalle_entrada("+response.id+")'>"
                            +"<i class='bi bi-search pe-1'></i> Ver"
                        +"</button>"
                    + "</td>"
                    +"</tr>"
                )
            }

        });
    } else {
        $('#mensaje_error').removeClass('visually-hidden').empty().append('<h6>Ingresa almenos un producto para continuar</h6>')
    }

}

function validar_datos_registro() {
    let valid_provee = validar_campos_vacios('proveedor')
    let valid_refer = validar_campos_vacios('referencia')
    if (valid_refer && valid_provee) {
        $.ajax({
            url: '/product/validate-data/',
            data: { 'proveedor': obtener_valor('proveedor'), 'referencia': obtener_valor('referencia') },
            method: 'GET',
            async: false,
            success: function (response) {
               
                if (response.lista_errores.length != 0) {
                    for (error in response.lista_errores) {
                        $('#id_' + response.lista_errores[error]['campo']).addClass('is-invalid')
                        $('#invalid_' + response.lista_errores[error]['campo']).empty().append(response.lista_errores[error]['mensaje'])
                    }
                } else {
                    $('#id_proveedor').removeClass('is-invalid').attr('readonly', true)
                    $('#id_referencia').removeClass('is-invalid').attr('readonly', true)
                    $('#btn_sig').addClass('visually-hidden')
                    $('#row_producto').removeClass('visually-hidden')
                    lista_productos.referencia = obtener_valor('referencia')
                    lista_productos.id_proveedor = obtener_valor('proveedor')
                    $('#row_producto').removeClass('visually-hidden')
                    $('#btn_sig').addClass('visually-hideen').attr('disabled', true)
                    $('#id_producto').focus()
                }


            }
        })
    }

}

function limpiar_formulario_entrada() {
    $('#formulario').trigger("reset")
    $('#id_referencia').attr('readonly', false)
    $('#id_proveedor').attr('readonly', false).removeClass('is-invalid')
    $('#btn_sig').removeClass('visually-hidden').attr('disabled', false)
    $('#row_producto').addClass('visually-hidden')
    $('#lista_productos').empty()
    $('#modal_formulario_entrada').modal('hide')
    lista_productos.splice(0, lista_productos.length)
    lista_productos.referencia = ''
    lista_productos.id_proveedor = ''
}

function limpiar_formulario_ingreso() {
    $('#modal_formulario_ingreso').modal('hide')
    $('#lista_productos_ingreso').empty()
    $('#codigo').val('').removeClass('is-invalid').attr('disabled',false)
    $('#codigo').removeClass('is-valid')
    $('#btn_ingresar_producto').removeClass('disabled')
    lista_productos.splice(0, lista_productos.length)

}


/*---------------- edicion de detalle de entrada antes del registro */

function llenar_formulario(id_entrada) {
    $.ajax({
        url: '/product/entry-detail/',
        type: 'GET',
        data: { 'id_entrada': id_entrada },
        success: function (response) {
            $('#modal_detalle_entrada').modal('hide')
            $('#modal_formulario_entrada').modal('show')
            $('#row_producto').removeClass('visually-hidden')
            $('#id_referencia').val(response.reference).attr('readonly', true)
            $('#id_proveedor').val(response.supplier).attr('readonly', true)
            $('#btn_sig').addClass('visually-hidden')
            $('#lista_productos').empty()
            $('#btn_crear_entrada').addClass('visually-hidden')
            $('#btn_editar_entrada').removeClass('visually-hidden').attr('onclick', "actualizar_entrada(" + id_entrada + ")")
            for (detail in response.details) {
                var item = "<tr id='fila_" + response.details[detail]['code'] + "'>"
                    + "<td>" + response.details[detail]['code'] + "</td>"
                    + "<td>" + response.details[detail]['name'] + "</td>"
                    + "<td>" + response.details[detail]['category'] + "</td>"
                    + "<td id='cantidad_" + response.details[detail]['code'] + "'>" + response.details[detail]['quantity'] + "</td>"
                    + "<td><button class='btn  btn-outline-danger btn-sm' id='btn_del_" + response.details[detail]['code'] + "' type='button' data-bs-toggle='tooltip' data-bs-placement='bottom' data-bs-custom-class='custom-tooltip' title='Eliminar este producto de la lista' ><i class='bi bi-trash-fill'></i></button></td>"
                    + "</tr>"
                lista_productos.push({ 'codigo': response.details[detail]['code'], 'cantidad': response.details[detail]['quantity'] })
                $('#lista_productos').append(item)
                $('#btn_del_' + response.details[detail]['code']).attr("onclick", "eliminar_prod_lista('" + response.details[detail]['code'] + "')")

            }
            console.log(lista_productos)
        }

    })
}

function actualizar_entrada(id_entrada) {
    if (lista_productos.length > 0) {
        const csrftoken = document.querySelector('[name=csrfmiddlewaretoken]').value;
        $.ajax({
            data: {
                'data': JSON.stringify(lista_productos),
                
            },
            url: '/product/entry-update/' + id_entrada + "/",
            type: 'POST',
            headers: { 'X-CSRFToken': csrftoken },
            success: function (response) {
                limpiar_formulario_entrada()
                $('.table-active').removeClass('table-active')
                $('#row_'+response.id).addClass('table-active')
                $('#success_modal').modal('show')
                $('#titulo_success').empty().append('Actualizar nueva entrada')
                $('#parrafo_success').empty().append('La nueva entrada ha  sido actualizada exitosamente')
            }

        });
    } else {
        $('#mensaje_error').removeClass('visually-hidden').empty().append('<h6>Ingresa almenos un producto para continuar</h6>')
    }
}

function actualizar_ingreso() {
    let cad = ''
    let indice = $('#codigo').val().indexOf("-")
    if (indice != -1) {
        cad = $('#codigo').val().substring(0, indice).trim()
    } else {
        cad = $('#codigo').val().trim()
    }
    let bandera = false

    for (let i = 0; i < lista_productos.length; i++) {

        if (lista_productos[i]['codigo'] === cad) {
            
            if (lista_productos[i]['espera'] != 0) {
                for(codigo in lista_productos[i]['lista_codigos']){
                    if(lista_productos[i]['lista_codigos'][codigo] == $('#codigo').val().trim() ){
                        bandera = true
                        lista_productos[i]['ingreso'] = lista_productos[i]['ingreso'] + 1
                        lista_productos[i]['espera'] = lista_productos[i]['espera'] - 1
                        $('#codigo').val('').focus().removeClass('is-invalid')
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
                $('#codigo').addClass('is-invalid')
                $('#invalid_codigo').empty().append('Ya han sido registrado todos los productos en espera correspondientes a este codigo')

            }
        }
        if (!bandera) {
            $('#codigo').removeClass('is-valid')
            $('#codigo').addClass('is-invalid')
            $('#invalid_codigo').empty().append('El codigo de producto ingresado no esta dentro de la lista de espera o ya ha sido ingresado')

        }else{
            $('#codigo').addClass('is-valid')
            $('#valid_codigo').empty().append('Codigo ingresado exitosamente')

        }
    }
    if (lista_productos.length == 0) {
        $('#codigo').removeClass('is-valid')
        $('#codigo').addClass('is-invalid disabled').attr('disabled', true)
        $('#btn_ingresar_producto').addClass('disabled')
        $('#btn_crear_ingreso').removeClass('disabled')
        $('#invalid_codigo').empty().append('Ya han sido registrados todos los productos en espera, Presiona "ingresar" para guardar el registro')
        enviar = true
    }


}

function confirmar_ingreso(id_entrada) {
    $('#modal_detalle_entrada').modal('hide')
    $('#modal_confirmacion_qr').modal('show')
    $('#confirmacion').attr('onclick', 'generar_codigo_qr(' + id_entrada + ')')

}

function generar_codigo_qr(id_entrada) {

    $.ajax({
        url: '/product/create-qr-code',
        type: 'GET',
        data: { 'id_entrada': id_entrada },
        success: function (response) {
            var a = document.createElement('a');
            var file_name = "codigo_qr_"+response['data']+".png";
            //a.href = "http://localhost:8000/"+response['data'];
            a.href = "http://188.166.35.48/"+response['data'];
            a.download = file_name;
            a.click();
            llenar_formulario_ingreso(id_entrada)
        }
    })
}

function llenar_formulario_ingreso(id_entrada,url) {

    $.ajax({
        url: '/product/entry-detail',
        type: 'GET',
        data: { 'id_entrada': id_entrada,'aux' : true },
        success: function (response) {
            for (detail in response.details) {
                var item = "<tr id='fila_" + response.details[detail]['code'] + "'>"
                    + "<td>" + response.details[detail]['code'] + "</td>"
                    + "<td>" + response.details[detail]['name'] + "</td>"
                    + "<td>" + response.details[detail]['category'] + "</td>"
                    + "<td id='cantidad_espera_" + response.details[detail]['code'] + "'><span class='badge bg-danger px-3 py-2'>" + response.details[detail]['quantity'] + "</span></td>"
                    + "<td id='cantidad_ingreso_" + response.details[detail]['code'] + "'><span class='badge bg-warning px-3 py-2'>0</span></td>"
                    + "</tr>"
                lista_productos.push({ 'codigo': response.details[detail]['code'], 'espera': response.details[detail]['quantity'], 'ingreso': 0 , 'lista_codigos' : response.details[detail]['code_list']})
                $('#lista_productos_ingreso').append(item)

            }
            console.log(lista_productos)
            $('#cabezera_ingreso').empty().append(
                "<h6 class='col-9'><b>Referencia : </b> " + response.reference + "</h6>"
                
                +"<a href='' class='col-3 btn-link link-primary text-decoration-none' id='descargar_img'>Descargar codigos qr</a>"
                )
                
            //$('#descargar_img').attr('href',"http://localhost:8000/"+response.url)
            $('#descargar_img').attr('href',"http://188.166.35.48/"+response.url)
            $('#descargar_img').attr('download','codigo_qr.png')
        }
    })
    $('#modal_detalle_entrada').modal('hide')
    $('#modal_confirmacion_qr').modal('hide')
    $('#modal_formulario_ingreso').modal('show')
    $('#btn_crear_ingreso').attr('onclick','enviar_ingreso('+id_entrada+')')
}   

function enviar_ingreso(id_entrada){
    if(enviar){
        const csrftoken = document.querySelector('[name=csrfmiddlewaretoken]').value;

        $.ajax({
            url: '/product/entry-income/' + id_entrada + "/",
            data : {'data':true},
            type : 'POST',
            headers: { 'X-CSRFToken': csrftoken },
            success: function(response){
                $('#modal_formulario_ingreso').modal('hide')
                $('#success_modal').modal('show')
                limpiar_formulario_ingreso()
                $('.table-active').removeClass('table-active')
                $('#row_'+response.id).addClass('table-active')
                $('#estado_'+response.id).empty().append("<span class='badge bg-success px-4 py-2'>Ingresado</span>")
                $('#titulo_success').empty().append('Registro de  productos')
                $('#parrafo_success').empty().append('El registro de los productos ha sido exitoso')
            }
        })
    }
}


function llenar_lista(response){
    $('#lista_entradas').empty()
    for(entrada in response.list){
        var item = "<tr id='row_"+response.list[entrada]['id']+"' >"
        + "<td>" + response.list[entrada]['reference'] + "</td>"
        + "<td id='td_nombre_"+response.list[entrada]['id']+"'>" + response.list[entrada]['supplier'] + "</td>"
        + "<td id='td_categoria_"+response.list[entrada]['id']+"'>" + response.list[entrada]['created'] + "</td>"
        if(response.list[entrada]['in_wait']){
		    item = item + "<td id='estado_'"+response.list[entrada]['id'] +"><span class='badge bg-danger px-4 py-2'>En espera</span></td>"       
        }else{
		    item = item + "<td id='estado_'"+response.list[entrada]['id'] +"><span class='badge bg-success px-4 py-2'>Ingresado</span></td>"
         
        }

        item = item  +"<td>"
            + "<button type='button' class='btn btn-primary btn-sm d-inline-flex  px-3 '"
                +"onclick='detalle_entrada("+response.list[entrada]['id']+")'>"
                +"<i class='bi bi-search pe-1'></i> Ver"
            +"</button>"
        + "</td>"
        +"</tr>"
        
        $('#lista_entradas').append(item)
    }
}

function filtrar_entrada_proveedor(){
    
    $.ajax({
        url: '/product/entry-filter-supplier/',
        data: { 'id_supplier': $('#select_supplier').val()},
        type: 'GET',
        success: function (response) {
            llenar_lista(response)
        }
    })
}

function filtrar_entrada_referencia(){
    
    $.ajax({
        url: '/product/entry-filter-reference/',
        data: { 'term': $('#input_search').val()},
        type: 'GET',
        success: function (response) {
            llenar_lista(response)
        }
    })
}
