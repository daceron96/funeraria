function limpiar_formulario() {
    $('#formulario').trigger("reset")
    $('.is-invalid').removeClass('is-invalid')
    $('#btn_guardar').removeClass('visually-hidden')
    $('#btn_actualizar').addClass('visually-hidden')
    contenido_formulario()
}

function error_formulario(error) {
    let errors = Object.keys(error.responseJSON.error)
    $('.is-invalid').removeClass('is-invalid')
    for (let item in errors) {
        $('#invalid_' + errors[item]).empty()
        $('#id_' + errors[item]).addClass('is-invalid')
        $('#invalid_' + errors[item]).append(error.responseJSON.error[errors[item]])

    }
}

function mayus(e) {
    e.value = e.value.toUpperCase();
}
