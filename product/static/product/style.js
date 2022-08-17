
function contenido_formulario() {
    $('#modal_formulario').modal('show')
    $('#titulo_form').empty().append("<i class='bi bi-clipboard-plus-fill pe-1'></i> Registrar nuevo producto")
    $('#id_code').removeAttr('readonly', 'false')
    $('#btn_guardar').attr('onclick','crear_producto()')

}

$(document).ready(function () {
    $('#link_producto').addClass('active')
});


function crear_producto() {
    $.ajax({
        data: $('#formulario').serialize(),
        url: '/product/product-create/',
        type: $('#formulario').attr('method'),
        success: function (response) {
            $('#modal_formulario').modal('hide')
            $('#success_modal').modal('show')
            $('#titulo_success').empty().append('Registro de nuevo producto')
            $('#parrafo_success').empty().append('El nuevo producto ha sido registrado exitosamente')
            $('.table-active').removeClass('table-active')
            $('#lista_productos').prepend(
			    "<tr class='text-center table-active' id='row_"+response.id+"' >"
                + "<td>" + response.code + "</td>"
                + "<td id='td_nombre_"+response.id+"'>" + response.name + "</td>"
                + "<td id='td_categoria_"+response.id+"'>" + response.category + "</td>"
				+ "<td><span class='badge bg-danger px-4 py-2'>0</span></td>"
				+ "<td><span class='badge bg-success px-4 py-2'>0</span></td>"
                +"<td>"
					+ "<button type='button' class='btn btn-primary btn-sm d-inline-flex  px-3 '"
						+"onclick='detalle_producto("+response.id+")'>"
						+"<i class='bi bi-search pe-1'></i> Ver"
					+"</button>"
				+ "</td>"
                +"</tr>"
            )
        },
        i: function (error) {
            error_formulario(error)
        }
    })
}

function detalle_producto(id_producto) {
    $.ajax({
        url: '/product/product-detail/',
        type: 'GET',
        data: { 'id_producto': id_producto },

        success: function (response) {
            $('#modal_detalle_producto').modal('show')
            $('#cabeza').empty().append('<b>' + response.name + ' - ' + response.category + ' </b>')
            $('#fecha_registro').empty().append('Fecha de registro: ' + response.created_date)
            $('#proveedores').empty()
            if (response.suppliers.length > 0) {
                $('#thead').removeClass('visually-hidden')
                for (supplier in response.suppliers) {
                    var item = '<tr>'
                        + "<td>" + response.suppliers[supplier]['name'] + "</td>"
                        + "<td>" + response.suppliers[supplier]['identifier'] + "</td>"
                    if (parseInt(response.suppliers[supplier]['stock_in_cellar']) > 5) {
                        item = item + "<td><span class='badge bg-success px-3 py-2'>" + response.suppliers[supplier]['stock_in_cellar'] + "</span> </td>"
                    } else {
                        item = item + "<td><span class='badge bg-danger px-3 py-2'>" + response.suppliers[supplier]['stock_in_cellar'] + "</span> </td>"
                    }
                    if (parseInt(response.suppliers[supplier]['stock_in_wait']) > 0) {
                        item = item + "<td><span class='badge bg-warning px-3 py-2'>" + response.suppliers[supplier]['stock_in_wait'] + "</span> </td>"
                    } else {
                        item = item + "<td><span class='badge bg-success px-3 py-2'>" + response.suppliers[supplier]['stock_in_wait'] + "</span> </td>"
                    }
                    item = item + '</tr>'
                    $('#proveedores').append(item)
                }
            } else {
                $('#thead').addClass('visually-hidden')
                $('#proveedores').append("<h4 class='mt-4'><b> Este producto no tiene proveedores registrados </b></h4>")

            }
            $('#btn_act_producto').attr('onclick', 'obtener_datos_producto(' + response.id + ')')
        }
    })
}

function actualizar_producto(id_producto) {
    $.ajax({
        data: $('#formulario').serialize(),
        url: '/product/product-update/' + id_producto + "/",
        type: $('#formulario').attr('method'),
        success: function (response) {
            console.log(response)
            $('#modal_formulario').modal('hide')
            $('#success_modal').modal('show')
            $('#titulo_success').empty().append('Actualizar producto')
            $('#parrafor_success').empty().append('El producto ha sido actualizado exitosamente')
            $('.table-active').removeClass('table-active')
            $('#row_'+response.id).addClass('table-active')
            $('#td_nombre_'+response.id).empty().append(response.name)
            $('#td_categoria_'+response.id).empty().append(response.category)

        },
        error: function (error) {
            error_formulario(i)
        }
    })
}

function obtener_datos_producto(id_producto) {

    $.ajax({
        url: '/product/product-update/' + id_producto + "/",
        type: 'GET',
        success: function (response) {
            $('.is-invalid').removeClass('is-invalid')
            $('#btn_actualizar').removeClass('visually-hidden').attr('onclick', "actualizar_producto(" + id_producto + ")")
            $('#btn_guardar').addClass('visually-hidden')
            $('#titulo_form').empty().append("<i class='bi bi-clipboard-plus-fill pe-1'></i> Actualizar producto")

            $('#modal_formulario').modal('show')
            $('#id_code').val(response.code).attr('readonly', 'true')
            $('#id_name').val(response.name)
            $('#id_description').val(response.description)
            $("#id_category").val(response.category)
        }

    })
}

function llenar_lista(response){
    $('#lista_productos').empty()
    console.log(response)
    for(product in response.list){
        var item = "<tr id='row_"+response.list[product]['id']+"' >"
        + "<td>" + response.list[product]['code'] + "</td>"
        + "<td id='td_nombre_"+response.list[product]['id']+"'>" + response.list[product]['name'] + "</td>"
        + "<td id='td_categoria_"+response.list[product]['id']+"'>" + response.list[product]['category'] + "</td>"
        if(response.list[product]['stock_in_cellar'] >= 10){
            item = item +  "<td><span class='badge bg-success px-4 py-2'>"+response.list[product]['stock_in_cellar']+"</span></td>"
        }else if(response.list[product]['stock_in_cellar'] == 0 ){
            item = item  + "<td><span class='badge bg-danger px-4 py-2'>"+response.list[product]['stock_in_cellar']+"</span></td>"
        }else{
            item = item  + "<td><span class='badge bg-warning px-4 py-2'>"+response.list[product]['stock_in_cellar']+"</span></td>"
        }
        if(response.list[product]['stock_in_wait'] == 0){
            item = item + "<td><span class='badge bg-success px-4 py-2'>"+response.list[product]['stock_in_wait']+"</span></td>"            
        }else{
            item = item + "<td><span class='badge bg-warning px-4 py-2'>"+response.list[product]['stock_in_wait']+"</span></td>"
        }
        item = item +"<td>"
            + "<button type='button' class='btn btn-primary btn-sm d-inline-flex  px-3 '"
                +"onclick='detalle_producto("+response.list[product]['id']+")'>"
                +"<i class='bi bi-search pe-1'></i> Ver"
            +"</button>"
        + "</td>"
        +"</tr>"
        
        $('#lista_productos').append(item)
    }
}

function filtrar_producto_nombre(){
    
    $.ajax({
        url: '/product/product-filter-name/',
        data: { 'term': $('#input_search').val().trim() },
        type: 'GET',
        success: function (response) {
            llenar_lista(response)
        }
    })
}

function filtrar_producto_categoria(){
    
    $.ajax({
        url: '/product/product-filter-category/',
        data: { 'id_category': $('#select_category').val()},
        type: 'GET',
        success: function (response) {
            llenar_lista(response)
        }
    })
}

