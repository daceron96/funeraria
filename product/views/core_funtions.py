from django.http import JsonResponse

def humanizar_fecha(fecha):
	fecha = str(fecha)
	meses = {
		'01' : 'Enero',
		'02' : 'Febrero',
		'03' : 'Marzo',
		'04' : 'Abril',
		'05' : 'Mayo',
		'06' : 'Junio',
		'07' : 'Julio',
		'08' : 'Agosto',
		'09' : 'Septiembre',
		'10' : 'Octubre',
		'11' : 'Noviembre',
		'12' : 'Diciembre',
	}

	return str(fecha[8:10] + " de " + meses[fecha[5:7]] + " de " + fecha[0:4])

