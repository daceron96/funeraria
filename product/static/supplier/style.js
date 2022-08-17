$(document).ready(function () {
    $('#link_proveedor').addClass('active')
});

function contenido_formulario() {
    $('#modal_formulario').modal('show')
    $('#titulo_form').empty().append("<i class='bi bi-clipboard-plus-fill pe-1'></i> Registrar nuevo proveedor")
    $('#btn_guardar').attr('onclick','crear_proveedor()')

}


function crear_proveedor() {
    $.ajax({
        data: $('#formulario').serialize(),
        url: '/product/supplier-create/',
        type: $('#formulario').attr('method'),
        success: function (response) {
            $('#modal_formulario').modal('hide')
            $('#success_modal').modal('show')
            $('#titulo_success').empty().append('Registro de nuevo proveedor')
            $('#parrafo_success').empty().append('El proveedor ha sido registrado exitosamente')
            $('.table-active').removeClass('table-active')

            $('#lista_proveedores').prepend(
                "<tr id='row_"+response.id+"' class='table-active' >" 
				+ "<td id='td_identificador_"+response.id+"'>"+response.identifier +"</td>"
				+ "<td id='td_nombre_"+response.id+"'>"+response.name +"</td>"
				+ "<td>"+response.created_date +"</td>"
				+ "<td id='td_updated_"+response.id+"'>"+response.modified_date +"</td>"
                + "<td>"
                 + "<button type='button' class='btn btn-primary btn-sm d-inline-flex  px-3' onclick='obtener_datos_proveedor("+response.id+")'>"
                    + "<i class='bi bi-pencil-square pe-1'></i> Editar"
                +"</button>"
                +"</td></tr>"
            )
        },
        error: function (error) {
            error_formulario(error)
        }
    })
}


function actualizar_proveedor(id_proveedor) {
    $.ajax({
        data: $('#formulario').serialize(),
        url: '/product/supplier-update/' + id_proveedor + "/",
        type: $('#formulario').attr('method'),
        success: function (response) {
            $('#modal_formulario').modal('hide')
            $('#success_modal').modal('show')
            $('#titulo_success').empty().append('Actualizar proveedor')
            $('#parrafo_success').empty().append('El proveedor ha sido actualizada exitosamente')
            $('#td_identificador_'+response.id).empty().append(response.identifier)
            $('#td_nombre_'+response.id).empty().append(response.name)
            $('#td_updated_'+response.id).empty().append(response.modified_date)
            $('.table-active').removeClass('table-active')
            $('#row_'+response.id).addClass('table-active')
        },
        error: function (error) {
            error_formulario(error)
        }
    })
}

function obtener_datos_proveedor(id_proveedor) {

    $.ajax({
        url: '/product/supplier-update/' + id_proveedor + "/",
        type: 'GET',
        success: function (response) {
            $('.is-invalid').removeClass('is-invalid')
            $('#btn_actualizar').removeClass('visually-hidden').attr('onclick', "actualizar_proveedor(" + id_proveedor + ")")
            $('#btn_guardar').addClass('visually-hidden')
            $('#titulo_form').empty().append("<i class='bi bi-pencil-square pe-1'></i> Actualizar proveedor")
            $('#modal_formulario').modal('show')
            $('#id_name').val(response.name)
            $('#id_identifier').val(response.identifier)
        }

    })
}
