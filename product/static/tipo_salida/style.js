$(document).ready(function () {
    $('#link_tipo_salida').addClass('active').removeClass('link-dark')
});


function contenido_formulario() {
    $('#modal_formulario').modal('show')
    $('#titulo_form').empty().append("<b><i class='bi bi-clipboard-plus-fill'></i> Registrar nuevo tipo de salida</b>")
    $('#btn_guardar').attr('onclick','crear_tipo_salida()')

}

function crear_tipo_salida() {
    const csrftoken = document.querySelector('[name=csrfmiddlewaretoken]').value;
    $.ajax({
        data: $('#formulario').serialize(),
        url: '/product/exit-type-create/',
        type: $('#formulario').attr('method'),
        headers: { 'X-CSRFToken': csrftoken },
        
        success: function (response) {
            $('#lista_tipo_salida').prepend(
                "<tr id='row_"+response.id+"' class='table-active' >" 
				+ "<td id='td_nombre_"+response.id+"'>"+response.nombre +"</td>"
				+ "<td>"+response.created +"</td>"
				+ "<td id='td_updated_"+response.id+"'>"+response.updated +"</td>"
                + "<td>"
                 + "<button type='button' class='btn btn-primary btn-sm d-inline-flex  px-3' onclick='obtener_datos_tipo_salida("+response.id+")'>"
                    + "<i class='bi bi-pencil-square pe-1'></i> Editar"
                +"</button>"
                +"</td></tr>"
            )
            $('#modal_formulario').modal('hide')
            $('#success_modal').modal('show')
            $('#titulo_success').empty().append('Registro de nuevo tipo de salida')
            $('#parrafo_success').empty().append('El nuevo tipo de salida ha sido registrado exitosamente')
        },
        error: function (error) {
            error_formulario(error)
        }
    })
}

function actualizar_tipo_salida(id_tipo_salida) {
    $.ajax({
        data: $('#formulario').serialize(),
        url: '/product/exit-type-update/' + id_tipo_salida + "/",
        type: $('#formulario').attr('method'),
        success: function (response) {

            $('#td_nombre_'+response.id).empty().append(response.nombre)
            $('#td_updated_'+response.id).empty().append(response.updated)
            $('.table-active').removeClass('table-active')

            $('#row_'+response.id).addClass('table-active')
            $('#modal_formulario').modal('hide')
            $('#success_modal').modal('show')
            $('#titulo_success').empty().append('Actualizar tipo de salida')
            $('#parrafo_success').empty().append('El tipo de salida  ha sido actualizada exitosamente')
        },
        error: function (error) {
            error_formulario(error)
        }
    })
}


function obtener_datos_tipo_salida(id_tipo_salida) {

    $.ajax({
        url: '/product/exit-type-update/' + id_tipo_salida + "/",
        type: 'GET',
        success: function (response) {
            $('.is-invalid').removeClass('is-invalid')
            $('#btn_actualizar').removeClass('visually-hidden').attr('onclick', "actualizar_tipo_salida(" + id_tipo_salida + ")")
            $('#btn_guardar').addClass('visually-hidden')
            $('#titulo_form').empty().append("<b><i class='bi bi-pencil-square'></i> Actualizar tipo de salida</b>")
            $('#modal_formulario').modal('show')
            $('#id_name').val(response.nombre)
            console.log(response)
        }

    })
}


