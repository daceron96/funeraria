$(document).ready(function () {
    $('#link_categoria').addClass('active')
});

function contenido_formulario() {
    $('#modal_formulario').modal('show')
    $('#titulo_form').empty().append("<i class='bi bi-clipboard-plus-fill pe-1'></i> Registrar nueva categoria")
    $('#btn_guardar').attr('onclick','crear_categoria()')

}


function crear_categoria() {
    $.ajax({
        data: $('#formulario').serialize(),
        url: '/product/category-create/',
        type: $('#formulario').attr('method'),
        success: function (response) {
            console.log(response)
            $('#modal_formulario').modal('hide')
            $('#success_modal').modal('show')
            $('#titulo_success').empty().append('Registro de nueva categoria')
            $('#parrafo_success').empty().append('La nueva categoria ha sido registrada exitosamente')
            $('.table-active').removeClass('table-active')

            $('#lista_categorias').prepend(
                "<tr id='row_"+response.id+"' class='table-active' >" 
				+ "<td id='td_nombre_"+response.id+"'>"+response.name +"</td>"
				+ "<td>"+response.created_date +"</td>"
				+ "<td id='td_updated_"+response.id+"'>"+response.modified_date +"</td>"
                + "<td>"
                 + "<button type='button' class='btn btn-primary btn-sm d-inline-flex  px-3' onclick='obtener_datos_categoria("+response.id+")'>"
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


function actualizar_categoria(id_categoria) {
    $.ajax({
        data: $('#formulario').serialize(),
        url: '/product/category-update/' + id_categoria + "/",
        type: $('#formulario').attr('method'),
        success: function (response) {
            $('#modal_formulario').modal('hide')
            $('#success_modal').modal('show')
            $('#titulo_success').empty().append('Actualizar categoria')
            $('#parrafo_success').empty().append('la categoria ha sido actualizada exitosamente')
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

function obtener_datos_categoria(id_categoria) {

    $.ajax({
        url: '/product/category-update/' + id_categoria + "/",
        type: 'GET',
        success: function (response) {
            $('.is-invalid').removeClass('is-invalid')
            $('#btn_actualizar').removeClass('visually-hidden').attr('onclick', "actualizar_categoria(" + id_categoria + ")")
            $('#btn_guardar').addClass('visually-hidden')
            $('#titulo_form').empty().append("<i class='bi bi-pencil-square pe-1'></i> Actualizar categoria")
            $('#modal_formulario').modal('show')
            $('#id_name').val(response.name)
        }

    })
}

